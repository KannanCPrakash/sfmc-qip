-- Email activity summarized
SELECT JobID, COUNT(*) AS Sends, SUM(CASE WHEN IsUnique=1 THEN 1 END) AS UniqueEvents
FROM _Click
GROUP BY JobID;