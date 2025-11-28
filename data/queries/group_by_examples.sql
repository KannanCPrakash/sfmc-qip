-- Group By examples
SELECT Domain, COUNT(*) AS Sends
FROM _Sent
GROUP BY Domain;