-- Example: Exit events captured in a custom DE 'Journey_ExitEvents'
SELECT Reason, COUNT(*) AS Exits
FROM Journey_ExitEvents
WHERE ExitDate >= DATEADD(MONTH,-1,GETDATE())
GROUP BY Reason
ORDER BY Exits DESC;
