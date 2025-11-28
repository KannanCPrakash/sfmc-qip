SELECT
   x.emailAddress
 , x.firstName
 , x.zip
 , x.store_zip
 , x.store_phone
 , x.ranking
 , x.distance
from (
    SELECT
      emailAddress
    , firstName
    , zip
    , store_zip
    , store_phone
    , row_number() over (
            partition by emailAddress
            order by emailAddress, distance
        ) as ranking /* list stores by distance */
    , distance
    FROM (
        SELECT
          customer.emailAddress
        , customer.firstName
        , customer.zip
        , store.store_zip
        , store.store_phone
        , ROUND(3961 * ACOS(
            CASE
            WHEN (pc1.XAxis * pc2.XAxis + pc1.YAxis *
                pc2.YAxis + pc1.ZAxis * pc2.ZAxis) > 1 THEN 1
            WHEN (pc1.XAxis * pc2.XAxis + pc1.YAxis *
                pc2.YAxis + pc1.ZAxis * pc2.ZAxis) < -1 THEN -1
            ELSE (pc1.XAxis * pc2.XAxis + pc1.YAxis *
                pc2.YAxis + pc1.ZAxis * pc2.ZAxis)
            END),0) distance
        FROM [store_customers] customer
        INNER JOIN [zip_axis] pc1 ON (pc1.zip = customer.zip)
        INNER JOIN [store_locations] store
            INNER JOIN [zip_axis] pc2 ON (pc2.zip = store.store_zip)
            ON ROUND(3961 * ACOS(
                CASE
                WHEN (pc1.XAxis * pc2.XAxis + pc1.YAxis *
                    pc2.YAxis + pc1.ZAxis * pc2.ZAxis) > 1 THEN 1
                WHEN (pc1.XAxis * pc2.XAxis + pc1.YAxis *
                    pc2.YAxis + pc1.ZAxis * pc2.ZAxis) < -1 THEN -1
                ELSE (pc1.XAxis * pc2.XAxis + pc1.YAxis *
                    pc2.YAxis + pc1.ZAxis * pc2.ZAxis)
                END),0
              ) > 0  /* set desired distance range here */
        WHERE customer.zip is not null
    ) rankedRows
) x
where x.ranking = 1