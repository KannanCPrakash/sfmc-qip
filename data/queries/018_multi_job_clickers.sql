-- Clickers across multiple jobs in last 30 days
SELECT c.SubscriberKey, COUNT(DISTINCT c.JobID) AS DistinctJobs
FROM _Click c
WHERE c.EventDate >= DATEADD(DAY,-30,GETDATE())
GROUP BY c.SubscriberKey
HAVING COUNT(DISTINCT c.JobID) >= 2;
