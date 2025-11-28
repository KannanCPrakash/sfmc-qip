-- Unsubscribe trend
SELECT DATEPART(WEEK, EventDate) AS WeekNumber, COUNT(*) AS Unsubs
FROM _Unsubscribe
GROUP BY DATEPART(WEEK, EventDate);