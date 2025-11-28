-- Level 1 - SELECT, FROM, WHERE
-- Find Subscriber Key for all Active (opted-in) Subscribers in All Subscribers list
SELECT SubscriberKey
FROM _Subscribers
WHERE Status = 'active';
