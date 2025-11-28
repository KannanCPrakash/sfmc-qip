-- Deliverability by domain
SELECT Domain,
COUNT(*) AS Sends,
SUM(CASE WHEN b.IsUnique=1 THEN 1 END) AS Bounces
FROM _Sent s
LEFT JOIN _Bounce b ON b.JobID=s.JobID AND b.SubscriberID=s.SubscriberID
GROUP BY Domain;