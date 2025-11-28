-- Top 20 domains by bounce rate in the last 1 month(s)
SELECT TOP 20
      s.Domain
    , COUNT(s.EventDate)                                        AS SendCount
    , COUNT(b.EventDate)                                        AS BounceCount
    , COUNT(b.EventDate) * 100.0 / NULLIF(COUNT(s.EventDate),0) AS BounceRate
FROM _Sent s
LEFT JOIN _Bounce b
  ON b.JobID = s.JobID
 AND b.BatchID = s.BatchID
 AND b.ListID = s.ListID
 AND b.SubscriberID = s.SubscriberID
 AND b.IsUnique = 1
WHERE s.EventDate >= DATEADD(MONTH, -1, GETDATE())
GROUP BY s.Domain
HAVING COUNT(s.EventDate) >= 100
ORDER BY BounceRate DESC;
