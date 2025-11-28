-- Referrer breakdown
SELECT Referrer, COUNT(*) AS Events
FROM WebEventsDE
WHERE EventDate >= DATEADD(DAY,-7,GETDATE())
GROUP BY Referrer
ORDER BY Events DESC;
