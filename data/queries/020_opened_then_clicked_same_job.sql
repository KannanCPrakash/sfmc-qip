-- Subscribers that both opened and clicked on the same Job
SELECT DISTINCT s.SubscriberKey
FROM _Sent s
JOIN _Open o ON o.JobID = s.JobID AND o.SubscriberID = s.SubscriberID
JOIN _Click c ON c.JobID = s.JobID AND c.SubscriberID = s.SubscriberID;
