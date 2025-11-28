-- Sent but not opened
SELECT s.SubscriberKey
FROM _Sent s
LEFT JOIN _Open o ON o.JobID=s.JobID AND o.SubscriberID=s.SubscriberID
WHERE o.EventDate IS NULL;