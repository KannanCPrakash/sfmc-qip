-- Sent but not opened within 14 days
SELECT DISTINCT s.SubscriberKey
FROM _Sent s
LEFT JOIN _Open o
  ON o.JobID = s.JobID
 AND o.SubscriberID = s.SubscriberID
 AND o.EventDate BETWEEN s.EventDate AND DATEADD(DAY,14, s.EventDate)
WHERE o.EventDate IS NULL;
