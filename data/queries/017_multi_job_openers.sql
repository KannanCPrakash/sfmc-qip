-- Openers across multiple jobs in last 30 days
SELECT o.SubscriberKey, COUNT(DISTINCT o.JobID) AS DistinctJobs
FROM _Open o
WHERE o.EventDate >= DATEADD(DAY,-30,GETDATE())
GROUP BY o.SubscriberKey
HAVING COUNT(DISTINCT o.JobID) >= 3;
