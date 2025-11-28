-- Level 2 - JOIN, Aliasing, NULL
-- Active Subscribers that were sent an email in the last 6 months (_Sent stores last 6 months)
SELECT sub.SubscriberKey
FROM _Subscribers   AS sub
    LEFT JOIN _Sent AS sent
        ON sent.SubscriberKey = sub.SubscriberKey
WHERE
    sub.Status = 'active'
    AND sent.EventDate IS NOT NULL;
