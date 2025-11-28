-- Sends per hour heatmap
SELECT DATEPART(HOUR, EventDate) AS HourOfDay, COUNT(*) AS Sends
FROM _Sent
WHERE EventDate >= DATEADD(DAY,-7,GETDATE())
GROUP BY DATEPART(HOUR, EventDate)
ORDER BY HourOfDay;
