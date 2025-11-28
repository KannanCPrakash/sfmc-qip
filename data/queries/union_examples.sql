-- UNION
SELECT SubscriberKey FROM _Sent
UNION
SELECT SubscriberKey FROM _Open;