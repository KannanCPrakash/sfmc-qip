-- Page depth per session
SELECT SessionID, COUNT(*) AS PageDepth
FROM WebEventsDE
GROUP BY SessionID
ORDER BY PageDepth DESC;
