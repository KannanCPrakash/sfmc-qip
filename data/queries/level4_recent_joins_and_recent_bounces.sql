-- Level 4 - Dates, WHERE operators, Conversion
-- Subscribers that joined within last year and had a bounce on gmail/outlook/yahoo
-- between the first day of current month (example date as string) and today
SELECT sub.SubscriberKey
FROM _Subscribers       AS sub
    INNER JOIN _Bounce  AS b
        ON b.SubscriberKey = sub.SubscriberKey
WHERE
    sub.DateJoined >= DATEADD(YEAR, -1, GETDATE())
    AND b.Domain IN ('gmail.com', 'outlook.com', 'yahoo.com')
    AND b.EventDate BETWEEN CONVERT(DATE, '2023-01-01') AND GETDATE();
