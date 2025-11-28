-- Click heatmap by URL
SELECT
    URL,
    COUNT(*) AS TotalClicks,
    SUM(CASE WHEN IsUnique = 1 THEN 1 ELSE 0 END) AS UniqueClicks
FROM _Click
GROUP BY URL
ORDER BY TotalClicks DESC;
