-- Non engagers
SELECT s.SubscriberKey
FROM _Subscribers s
LEFT JOIN _Open o ON o.SubscriberKey=s.SubscriberKey
WHERE o.SubscriberKey IS NULL;