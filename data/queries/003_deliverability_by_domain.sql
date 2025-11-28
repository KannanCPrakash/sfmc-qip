-- Deliverability by domain (sends vs. unique bounces)
SELECT s.Domain,
       COUNT(s.EventDate)                                        AS Sends,
       SUM(CASE WHEN b.IsUnique = 1 THEN 1 ELSE 0 END)           AS UniqueBounces,
       SUM(CASE WHEN b.IsUnique = 1 THEN 1 ELSE 0 END) * 100.0
           / NULLIF(COUNT(s.EventDate),0)                        AS BounceRate
FROM _Sent s
LEFT JOIN _Bounce b
  ON b.JobID = s.JobID
 AND b.SubscriberID = s.SubscriberID
WHERE s.EventDate >= DATEADD(MONTH,-1,GETDATE())
GROUP BY s.Domain
ORDER BY BounceRate DESC;
