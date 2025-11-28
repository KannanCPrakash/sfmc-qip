-- Open occurred before click within 24 hours
SELECT c.SubscriberKey, c.JobID
FROM _Click c
JOIN _Open o
  ON o.JobID = c.JobID
 AND o.SubscriberID = c.SubscriberID
WHERE o.EventDate BETWEEN DATEADD(HOUR,-24,c.EventDate) AND c.EventDate;
