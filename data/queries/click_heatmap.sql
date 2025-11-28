-- Click heatmap
SELECT URL, COUNT(*) AS Clicks
FROM _Click
GROUP BY URL
ORDER BY Clicks DESC;