-- Clicks on first activity of a Journey by name
SELECT
    sub.SubscriberKey,
    sub.EmailAddress
FROM _Subscribers sub
JOIN _Click c ON c.SubscriberKey = sub.SubscriberKey AND c.IsUnique = 1
JOIN _JourneyActivity ja ON ja.JourneyActivityObjectID = c.TriggererSendDefinitionObjectID
JOIN _Journey j ON j.VersionID = ja.VersionID
WHERE j.JourneyName = 'SelectedJourneyName' AND ja.ActivityName = 'SelectedEmailActivityName';
