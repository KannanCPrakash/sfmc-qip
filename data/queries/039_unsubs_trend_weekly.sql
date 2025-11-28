-- Weekly unsubscribe trend
SELECT DATEPART(ISO_WEEK, EventDate) AS IsoWeek, COUNT(*) AS Unsubs
FROM _Unsubscribe
WHERE EventDate >= DATEADD(WEEK,-12,GETDATE())
GROUP BY DATEPART(ISO_WEEK, EventDate)
ORDER BY IsoWeek;
