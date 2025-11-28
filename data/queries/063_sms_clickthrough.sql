-- SMS clickthrough (if clicks tracked in WebEventsDE via short links)
SELECT SubscriberKey, COUNT(*) AS Clicks
FROM WebEventsDE
WHERE Channel = 'SMS' AND PageURL LIKE 'http%'
GROUP BY SubscriberKey
ORDER BY Clicks DESC;
