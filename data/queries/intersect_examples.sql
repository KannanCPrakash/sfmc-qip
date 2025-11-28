-- INTERSECT
SELECT SubscriberKey FROM _Sent
INTERSECT
SELECT SubscriberKey FROM _Click;