-- Frequency capping: more than N sends in last M days
SELECT s.SubscriberKey, COUNT(*) AS SendsLast7
FROM _Sent s
WHERE s.EventDate >= DATEADD(DAY,-7,GETDATE())
GROUP BY s.SubscriberKey
HAVING COUNT(*) > 5;
