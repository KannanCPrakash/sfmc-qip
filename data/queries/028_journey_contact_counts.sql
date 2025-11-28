-- Contacts that entered journeys in last 30 days
SELECT j.JourneyName, COUNT(DISTINCT s.SubscriberKey) AS Contacts
FROM _Journey j
JOIN _JourneyActivity ja ON ja.VersionID = j.VersionID
JOIN _Sent s ON s.TriggererSendDefinitionObjectID = ja.JourneyActivityObjectID
WHERE s.EventDate >= DATEADD(DAY,-30,GETDATE())
GROUP BY j.JourneyName;
