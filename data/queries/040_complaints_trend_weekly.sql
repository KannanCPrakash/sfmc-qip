-- Weekly complaint trend
SELECT DATEPART(ISO_WEEK, EventDate) AS IsoWeek, COUNT(*) AS Complaints
FROM _Complaint
WHERE EventDate >= DATEADD(WEEK,-12,GETDATE())
GROUP BY DATEPART(ISO_WEEK, EventDate)
ORDER BY IsoWeek;
