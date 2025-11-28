-- Level 6 - GROUP, COUNT, TOP and HAVING
-- Top 20 domains by bounce rate for deliveries attempted in the last month
-- Note: Query Studio bug - no spaces around * in calc expressions
SELECT TOP 20
      s.Domain
    , COUNT(s.EventDate)    AS SendCount
    , COUNT(b.EventDate)    AS BounceCount
    , COUNT(b.EventDate)*100/COUNT(s.EventDate) AS BounceRate
FROM _Sent AS s
    LEFT JOIN _Bounce AS b
        ON b.JobID = s.JobID
        AND b.ListID = s.ListID
        AND b.BatchID = s.BatchID
        AND b.SubscriberID = s.SubscriberID
        AND b.IsUnique = 1
WHERE s.EventDate >= DATEADD(MONTH, -1, GETDATE())
GROUP BY s.Domain
HAVING COUNT(s.EventDate) >= 100
ORDER BY COUNT(b.EventDate)*100/COUNT(s.EventDate) DESC;
