-- EXCEPT
SELECT SubscriberKey FROM _Sent
EXCEPT
SELECT SubscriberKey FROM _Open;