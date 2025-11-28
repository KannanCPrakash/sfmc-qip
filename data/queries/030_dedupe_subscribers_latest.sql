-- Keep latest record per SubscriberKey in _Subscribers
SELECT *
FROM (
    SELECT t.*,
           ROW_NUMBER() OVER (PARTITION BY SubscriberKey ORDER BY DateJoined DESC) AS rn
    FROM _Subscribers t
) x
WHERE rn = 1;
