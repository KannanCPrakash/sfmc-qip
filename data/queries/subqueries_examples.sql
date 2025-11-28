-- Subquery examples
SELECT SubscriberKey
FROM _Subscribers
WHERE SubscriberKey IN (
    SELECT SubscriberKey FROM _Open
);