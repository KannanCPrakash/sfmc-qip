-- String functions
SELECT SubscriberKey, RIGHT(EmailAddress,10) AS Domain
FROM _Subscribers;