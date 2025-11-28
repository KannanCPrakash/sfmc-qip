-- Segment buckets by 30/60/90 recency
SELECT s.SubscriberKey,
       MAX(CASE WHEN e.LastEngagementDays <= 30 THEN 1 ELSE 0 END) AS Bucket_0_30,
       MAX(CASE WHEN e.LastEngagementDays BETWEEN 31 AND 60 THEN 1 ELSE 0 END) AS Bucket_31_60,
       MAX(CASE WHEN e.LastEngagementDays BETWEEN 61 AND 90 THEN 1 ELSE 0 END) AS Bucket_61_90
FROM _Subscribers s
JOIN (
  SELECT SubscriberKey, DATEDIFF(DAY, MAX(EventDate), GETDATE()) AS LastEngagementDays
  FROM (
    SELECT SubscriberKey, EventDate FROM _Open
    UNION ALL
    SELECT SubscriberKey, EventDate FROM _Click
  ) u
  GROUP BY SubscriberKey
) e ON e.SubscriberKey = s.SubscriberKey
GROUP BY s.SubscriberKey;
