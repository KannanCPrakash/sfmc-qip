-- Journey activity audit
SELECT j.JourneyName, ja.ActivityName, COUNT(c.EventDate) AS Clicks
FROM _Journey j
JOIN _JourneyActivity ja ON ja.VersionID=j.VersionID
LEFT JOIN _Click c ON c.TriggererSendDefinitionObjectID=ja.JourneyActivityObjectID
GROUP BY j.JourneyName, ja.ActivityName;