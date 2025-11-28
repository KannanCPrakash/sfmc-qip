-- Top clicked links
SELECT TOP 100
       c.URL,
       COUNT(*) AS TotalClicks,
       SUM(CASE WHEN c.IsUnique = 1 THEN 1 ELSE 0 END) AS UniqueClicks
FROM _Click c

GROUP BY c.URL
ORDER BY TotalClicks DESC;
