-- Returning visitors in last 30 days
SELECT SubscriberKey, COUNT(DISTINCT CONVERT(DATE, EventDate)) AS ActiveDays
FROM WebEventsDE
WHERE EventDate >= DATEADD(DAY,-30,GETDATE())
GROUP BY SubscriberKey
HAVING COUNT(DISTINCT CONVERT(DATE, EventDate)) >= 2;
