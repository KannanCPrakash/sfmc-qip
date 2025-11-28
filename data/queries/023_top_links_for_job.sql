-- Top clicked links for a given job
SELECT TOP 100
       c.URL,
       COUNT(*) AS TotalClicks,
       SUM(CASE WHEN c.IsUnique = 1 THEN 1 ELSE 0 END) AS UniqueClicks
FROM _Click c
WHERE c.JobID = @jobId
GROUP BY c.URL
ORDER BY TotalClicks DESC;
