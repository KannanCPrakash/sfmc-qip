-- Subscribers who clicked more than 3 times in last 60 days
SELECT c.SubscriberKey, COUNT(*) AS Clicks
FROM _Click c
WHERE c.EventDate >= DATEADD(DAY,-60,GETDATE())
GROUP BY c.SubscriberKey
HAVING COUNT(*) > 3
ORDER BY Clicks DESC;
