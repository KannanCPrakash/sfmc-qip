WITH 
available_countries_table AS (
  SELECT 
    i.country_code
  FROM dwh_metadata.ccr_items_v i
  WHERE i.rule_name = 'SALESFORCE'
),
available_campaigns_table AS (
  SELECT 
    c.country_code
    ,c.campaign_id
    ,c.start_date AS campaign_start_date
    ,c.end_date AS campaign_end_date
    ,c.relative_order
  FROM cdw.campaigns c
  INNER JOIN available_countries_table
        ON c.country_code = available_countries_table.country_code
  JOIN cdw.markets m
      ON c.country_code = m.country_code
  WHERE c.start_date >= add_months(SYSDATE, -36)  --get three years in the past
  AND c.relative_order < 0 -- do not include current open campaign
  -- AND c.start_date >= m.cumulus_since
),
in_sfmc_prep AS (
    SELECT --+materialize
    --Contacts who have opened any email
        to_number(subscriber_key) subscriber_key
        ,country_code
        ,campaign_id
        , 1 AS open_email
        , 0 AS sent_email
        , 0 AS push_sent_and_open
        , 0 AS push_sent
        , 0 AS sms_sent
    FROM mark_auto.sf_open
    WHERE regexp_like(subscriber_key, '^[[:digit:]]+$')
    GROUP BY 
        to_number(subscriber_key)
        ,country_code
        ,campaign_id
    UNION ALL
    SELECT -- Sent email
        to_number(subscribed_key) subscriber_key
        ,country_code
        ,campaign_id
        , 0 AS open_email
        , 1 AS sent_email
        , 0 AS push_sent_and_open
        , 0 AS push_sent
        , 0 AS sms_sent
    FROM mark_auto.sf_sent
    WHERE regexp_like(subscribed_key, '^[[:digit:]]+$')
    GROUP BY 
        to_number(subscribed_key)
        ,country_code
        ,campaign_id    
    UNION ALL
    SELECT -- Push notification sent and open
        c.customer_id
        ,c.country_code
        ,cp.campaign_id
        , 0 AS open_email
        , 0 AS sent_email
        , 1 AS push_sent_and_open
        , 0 AS push_sent
        , 0 AS sms_sent
    FROM (
        SELECT 
        mp.contact_key
        ,mp.date_sent         
        FROM mark_auto.sf_mobile_push_report mp
        WHERE length(TRIM(translate(contact_key, ' +-.0123456789', ' '))) IS NULL
        AND mp.message_opened = 'yes'
        ) mp
    JOIN cumulus.customers c
        ON to_number(mp.contact_key) = c.customer_id
    JOIN dwh_metadata.ccr_items_v i
        ON c.country_code = i.country_code
        AND i.rule_name = 'SALESFORCE'
    JOIN available_campaigns_table cp
        ON c.country_code = cp.country_code
    AND mp.date_sent BETWEEN cp.campaign_start_date AND cp.campaign_end_date
    GROUP BY 
        customer_id
        ,c.country_code
        ,cp.campaign_id
    UNION ALL
    SELECT -- Push notification just sent 
        c.customer_id
        ,c.country_code
        ,cp.campaign_id
        , 0 AS open_email
        , 0 AS sent_email
        , 0 AS push_sent_and_open
        , 1 AS push_sent
        , 0 AS sms_sent
    FROM (
        SELECT 
        mp.contact_key
        ,mp.date_sent         
        FROM mark_auto.sf_mobile_push_report mp
        WHERE length(TRIM(translate(contact_key, ' +-.0123456789', ' '))) IS NULL
        ) mp
    JOIN cumulus.customers c
        ON to_number(mp.contact_key) = c.customer_id
    JOIN dwh_metadata.ccr_items_v i
        ON c.country_code = i.country_code
        AND i.rule_name = 'SALESFORCE'
    JOIN available_campaigns_table cp
        ON c.country_code = cp.country_code
    AND mp.date_sent BETWEEN cp.campaign_start_date AND cp.campaign_end_date
    GROUP BY 
        customer_id
        ,c.country_code
        ,cp.campaign_id
    UNION ALL
    SELECT -- SMS
        c.customer_id
        ,c.country_code
        ,p.campaign_id
        , 0 AS open_email
        , 0 AS sent_email
        , 0 AS push_sent_and_open
        , 0 AS push_sent
        , 1 AS sms_sent
    FROM (
        SELECT --+materialize
        mt.subscriber_key
        ,mt.mobile
        ,mt.action_date
        FROM mark_auto.sf_sms_message_tracking mt
        WHERE length(TRIM(translate(subscriber_key, ' +-.0123456789', ' '))) IS NULL
        AND mt.sent = 'True'
        AND mt.delivered = 'True') mt
    JOIN cdw.customers c
        ON c.customer_id = to_number(mt.subscriber_key)
        AND c.country_code IN (SELECT country_code FROM dwh_metadata.ccr_items_v i WHERE i.rule_name = 'SALESFORCE')
    JOIN available_campaigns_table p
        ON p.country_code = c.country_code
        AND mt.action_date BETWEEN p.campaign_start_date AND p.campaign_end_date
),
in_sfmc_db AS
(
    SELECT --+materialize
        subscriber_key
        ,country_code
        ,campaign_id period_id
            ,CASE WHEN SUM(open_email) > 0 THEN 1 ELSE 0 END AS open_email
            ,CASE WHEN SUM(sent_email) > 0 THEN 1 ELSE 0 END AS sent_email
            ,CASE WHEN SUM(push_sent_and_open) > 0 THEN 1 ELSE 0 END AS push_sent_and_open
            ,CASE WHEN SUM(push_sent) > 0 THEN 1 ELSE 0 END AS push_sent
            ,CASE WHEN SUM(sms_sent) > 0 THEN 1 ELSE 0 END AS sms_sent
    FROM in_sfmc_prep
    GROUP BY subscriber_key
    ,country_code
    ,campaign_id
),
base_data_table AS (
  SELECT
      db_activity.COUNTRY_CODE AS country_code
      ,db_activity.CAMPAIGN_ID AS campaign_id
      ,act.relative_order AS relative_campaign_order
      ,act.campaign_start_date AS campaign_start_date
      ,db_activity.DISTRIBUTOR_NUMBER AS distributor_number
      ,db_activity.IS_ACTIVE AS is_active
      ,db_activity.CUSTOMER_ID AS customer_id
      ,NVL(db_activity.NET_SALES_OTH + db_activity.NET_SALES_BPS, 0) AS net_sales
      ,NVL(gs.SUBSEGMENT, 'None') AS sub_analytical_segment
      ,SUM(db_activity.IS_ACTIVE) OVER (
          PARTITION BY db_activity.COUNTRY_CODE, db_activity.DISTRIBUTOR_NUMBER
          ORDER BY db_activity.PERIOD_ID
          ROWS BETWEEN 16 PRECEDING AND CURRENT ROW
          ) AS rolling_17_sum  -- Selects one year of the data, should be changed to date for not 17 campaigns markets.
  FROM cdw.consultants_activity db_activity
  INNER JOIN available_campaigns_table act -- filters only those campaigns and countries needed
      ON db_activity.campaign_id = act.campaign_id
      AND db_activity.country_code = act.country_code
  LEFT JOIN crm.global_segments gs 
      ON gs.SEGMENT_ID = db_activity.CRM_SEGMENT_ID
  WHERE (db_activity.inactive_periods < 18 OR (db_activity.inactive_periods IS NULL AND db_activity.sign_up_date >= TRUNC(add_months(act.campaign_start_date, -12), 'YYYY')))
  -- Eliminate terminated contacts and handle the null case for inactivity
  AND db_activity.crm_segment_id != 10 -- Remove international brand partners
  AND db_activity.consultant_num IS NOT NULL
),
db_data AS (
  SELECT 
    bd.country_code
    ,bd.campaign_id
    ,bd.distributor_number
    ,bd.is_active
    ,bd.net_sales
    ,bd.sub_analytical_segment
    ,CUME_DIST() OVER (
        PARTITION BY bd.country_code 
        ORDER BY bd.rolling_17_sum
        ) AS quantile_activity
     ,CASE
        WHEN (sf.open_email=1 OR sf.push_sent_and_open=1 OR sf.sms_sent=1) THEN 'engaged'
        WHEN (sf.open_email=0 AND sf.push_sent_and_open=0 AND sf.sms_sent=0) AND (sf.sent_email = 1 OR sf.push_sent=1) THEN 'not_engaged'
        ELSE 'not_in_sfmc'
        END AS in_sfmc
  FROM base_data_table bd
  LEFT JOIN in_sfmc_db sf
      ON bd.country_code = sf.country_code
      AND bd.campaign_id = sf.period_id
      AND bd.customer_id = sf.subscriber_key
  WHERE bd.campaign_start_date >= add_months(SYSDATE, -24)
  AND bd.rolling_17_sum > 0
),
db_agg AS(
  SELECT
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
    ,'0.25' AS quantile_removed
    ,NULLIF(COUNT(db_data.distributor_number), 0) AS group_size
    ,SUM(db_data.net_sales) / NULLIF(SUM(db_data.is_active), 0) AS sales_per_active
    ,SUM(db_data.is_active) / NULLIF(COUNT(db_data.distributor_number), 0) AS activity
    ,NULLIF(AVG(db_data.net_sales), 0) AS mean_sales
    ,NULLIF(STDDEV(db_data.net_sales), 0) AS std
  FROM db_data
  WHERE db_data.quantile_activity < 0.75
  GROUP BY 
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
  UNION ALL
    SELECT
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
    ,'0.20' AS quantile_removed
    ,NULLIF(COUNT(db_data.distributor_number), 0) AS group_size
    ,SUM(db_data.net_sales) / NULLIF(SUM(db_data.is_active), 0) AS sales_per_active
    ,SUM(db_data.is_active) / NULLIF(COUNT(db_data.distributor_number), 0) AS activity
    ,NULLIF(AVG(db_data.net_sales), 0) AS mean_sales
    ,NULLIF(STDDEV(db_data.net_sales), 0) AS std
  FROM db_data
  WHERE db_data.quantile_activity < 0.80
  GROUP BY 
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
  UNION ALL
    SELECT
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
    ,'0.15' AS quantile_removed
    ,NULLIF(COUNT(db_data.distributor_number), 0) AS group_size
    ,SUM(db_data.net_sales) / NULLIF(SUM(db_data.is_active), 0) AS sales_per_active
    ,SUM(db_data.is_active) / NULLIF(COUNT(db_data.distributor_number), 0) AS activity
    ,NULLIF(AVG(db_data.net_sales), 0) AS mean_sales
    ,NULLIF(STDDEV(db_data.net_sales), 0) AS std
  FROM db_data
  WHERE db_data.quantile_activity < 0.85
  GROUP BY 
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
  UNION ALL
    SELECT
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
    ,'0.10' AS quantile_removed
    ,NULLIF(COUNT(db_data.distributor_number), 0) AS group_size
    ,SUM(db_data.net_sales) / NULLIF(SUM(db_data.is_active), 0) AS sales_per_active
    ,SUM(db_data.is_active) / NULLIF(COUNT(db_data.distributor_number), 0) AS activity
    ,NULLIF(AVG(db_data.net_sales), 0) AS mean_sales
    ,NULLIF(STDDEV(db_data.net_sales), 0) AS std
  FROM db_data
  WHERE db_data.quantile_activity < 0.90
  GROUP BY 
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
  UNION ALL
    SELECT
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
    ,'0.05' AS quantile_removed
    ,NULLIF(COUNT(db_data.distributor_number), 0) AS group_size
    ,SUM(db_data.net_sales) / NULLIF(SUM(db_data.is_active), 0) AS sales_per_active
    ,SUM(db_data.is_active) / NULLIF(COUNT(db_data.distributor_number), 0) AS activity
    ,NULLIF(AVG(db_data.net_sales), 0) AS mean_sales
    ,NULLIF(STDDEV(db_data.net_sales), 0) AS std
  FROM db_data
  WHERE db_data.quantile_activity < 0.95
  GROUP BY 
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
  UNION ALL
    SELECT
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
    ,'0.00' AS quantile_removed
    ,NULLIF(COUNT(db_data.distributor_number), 0) AS group_size
    ,SUM(db_data.net_sales) / NULLIF(SUM(db_data.is_active), 0) AS sales_per_active
    ,SUM(db_data.is_active) / NULLIF(COUNT(db_data.distributor_number), 0) AS activity
    ,NULLIF(AVG(db_data.net_sales), 0) AS mean_sales
    ,NULLIF(STDDEV(db_data.net_sales), 0) AS std
  FROM db_data
  WHERE db_data.quantile_activity <= 1.0
  GROUP BY 
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,db_data.in_sfmc
),
db_net_sales AS (
  SELECT 
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
    ,SUM(db_data.net_sales) AS net_sales
  FROM db_data
  GROUP BY 
    db_data.country_code
    ,db_data.campaign_id
    ,db_data.sub_analytical_segment
)
SELECT
    db_engaged.quantile_removed
    ,db_engaged.country_code
    ,db_engaged.campaign_id
    ,db_engaged.sub_analytical_segment 
    ,NVL(db_engaged.group_size * (db_engaged.sales_per_active * db_engaged.activity
    - db_non_engaged.sales_per_active * db_non_engaged.activity), 0) AS incrementality
    ,db_engaged.group_size AS engaged_group_size
    ,db_non_engaged.group_size AS non_engaged_group_size
    ,db_engaged.mean_sales AS mean_sales_engaged
    ,db_non_engaged.mean_sales AS mean_sales_non_engaged
    ,db_engaged.std AS std_engaged
    ,db_non_engaged.std AS std_non_engaged
    , ((db_engaged.mean_sales - db_non_engaged.mean_sales) 
    * SQRT(
    ((db_engaged.group_size + db_non_engaged.group_size - 2) *(db_engaged.group_size * db_non_engaged.group_size))
    /(db_engaged.group_size + db_non_engaged.group_size)
    )
    )
    / NULLIF(
    SQRT(
     (1 - (1/db_engaged.group_size)) * POWER(db_engaged.std, 2) 
    + (1 - (1/db_non_engaged.group_size)) * POWER(db_non_engaged.std, 2)
    )
    , 0) AS effect_size
     ,(db_engaged.group_size + db_non_engaged.group_size - 2) AS degrees_of_freedom
    ,db_net_sales.net_sales
FROM (SELECT * FROM db_agg WHERE db_agg.in_sfmc = 'engaged') db_engaged
LEFT JOIN (SELECT * FROM db_agg WHERE db_agg.in_sfmc = 'not_engaged') db_non_engaged
     ON db_engaged.country_code = db_non_engaged.country_code
     AND db_engaged.campaign_id = db_non_engaged.campaign_id
     AND db_engaged.sub_analytical_segment = db_non_engaged.sub_analytical_segment
     AND db_engaged.quantile_removed = db_non_engaged.quantile_removed
LEFT JOIN db_net_sales
    ON db_engaged.country_code = db_net_sales.country_code
    AND db_engaged.campaign_id = db_net_sales.campaign_id
    AND db_engaged.sub_analytical_segment = db_net_sales.sub_analytical_segment