-- Contacts in suppress list
SELECT s.SubscriberKey
FROM _Subscribers s
JOIN SuppressListDE sup ON sup.SubscriberKey = s.SubscriberKey;
