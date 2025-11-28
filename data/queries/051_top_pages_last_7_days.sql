-- Top pages by views (last 7 days)
SELECT PageURL, COUNT(*) AS Views
FROM WebEventsDE
WHERE EventDate >= DATEADD(DAY,-7,GETDATE())
GROUP BY PageURL
ORDER BY Views DESC;
