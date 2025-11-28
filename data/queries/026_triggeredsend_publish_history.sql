-- Triggered Send publish history (aggregated level)
SELECT TriggererSendDefinitionObjectID,
       COUNT(*) AS PublishEvents
FROM _Sent
WHERE TriggererSendDefinitionObjectID IS NOT NULL
GROUP BY TriggererSendDefinitionObjectID
ORDER BY PublishEvents DESC;
