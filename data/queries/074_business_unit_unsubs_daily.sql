-- Business unit unsubs daily trend (requires _BusinessUnitUnsubscribes view if available)
SELECT BUName, CONVERT(DATE, EventDate) AS EventDay, COUNT(*) AS Unsubs
FROM _BusinessUnitUnsubscribes
WHERE EventDate >= DATEADD(DAY,-30,GETDATE())
GROUP BY BUName, CONVERT(DATE, EventDate)
ORDER BY EventDay DESC;
