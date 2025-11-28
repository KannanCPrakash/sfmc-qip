-- ROW_NUMBER dedupe
SELECT *
FROM (
    SELECT *,
    ROW_NUMBER() OVER(PARTITION BY SubscriberKey ORDER BY EventDate DESC) AS rn
    FROM _Sent
) x
WHERE rn=1;