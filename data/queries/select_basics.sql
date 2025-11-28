-- Basic SELECT examples
SELECT TOP 100 *
FROM _Subscribers;

SELECT SubscriberKey, EmailAddress
FROM _Subscribers
WHERE Status='Active';