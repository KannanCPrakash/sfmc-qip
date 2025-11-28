-- Join examples
SELECT s.SubscriberKey, c.EventDate
FROM _Subscribers s
LEFT JOIN _Click c ON c.SubscriberKey=s.SubscriberKey;