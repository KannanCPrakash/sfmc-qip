-- Level 5 - Multiple JOINS, UNION, INTERSECT and EXCEPT
-- Subscribers who clicked a link in the first email activity of a selected Journey
-- (Includes a proof record via UNION)
SELECT
      sub.SubscriberKey
    , sub.EmailAddress
FROM _Subscribers               AS sub
    INNER JOIN _Click           AS c
        ON c.SubscriberKey = sub.SubscriberKey
        AND c.IsUnique = 1
    INNER JOIN _JourneyActivity AS ja
        ON ja.JourneyActivityObjectID = c.TriggererSendDefinitionObjectID
    INNER JOIN _Journey         AS j
        ON j.VersionID = ja.VersionID
WHERE
    j.JourneyName = 'SelectedJourneyName'
    AND ja.ActivityName = 'SelectedEmailActivityName'
UNION
SELECT
      'level5exercise'      AS SubscriberKey
    , '[email protected]'  AS EmailAddress;
