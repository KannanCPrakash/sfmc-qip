-- Send time performance by hour
SELECT DATEPART(HOUR, s.EventDate) AS Hour, COUNT(*) AS Sends,
       SUM(CASE WHEN o.EventDate IS NOT NULL THEN 1 ELSE 0 END) AS Opens,
       SUM(CASE WHEN c.EventDate IS NOT NULL THEN 1 ELSE 0 END) AS Clicks
FROM _Sent s
LEFT JOIN _Open o  ON o.JobID = s.JobID AND o.SubscriberID = s.SubscriberID
LEFT JOIN _Click c ON c.JobID = s.JobID AND c.SubscriberID = s.SubscriberID
WHERE s.EventDate >= DATEADD(DAY,-30,GETDATE())
GROUP BY DATEPART(HOUR, s.EventDate)
ORDER BY Hour;
