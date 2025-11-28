-- Derive domain from EmailAddress
SELECT
    SubscriberKey,
    EmailAddress,
    RIGHT(EmailAddress, LEN(EmailAddress) - CHARINDEX('@', EmailAddress)) AS Domain
FROM _Subscribers;
