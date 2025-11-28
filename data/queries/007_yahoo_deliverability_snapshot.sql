-- Yahoo deliverability snapshot (last 7 days)
SELECT
  COUNT(*) AS Sends,
  SUM(CASE WHEN b.EventDate IS NOT NULL THEN 1 ELSE 0 END) AS Bounces
FROM _Sent s
LEFT JOIN _Bounce b
  ON b.JobID = s.JobID AND b.SubscriberID = s.SubscriberID AND b.IsUnique = 1
WHERE s.Domain = 'yahoo.com' AND s.EventDate >= DATEADD(DAY,-7,GETDATE());
