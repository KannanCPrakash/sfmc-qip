-- Subscribers who engaged (opened or clicked) in the last 30 days
SELECT DISTINCT sub.SubscriberKey
FROM _Subscribers sub
LEFT JOIN _Open o  ON o.SubscriberKey = sub.SubscriberKey AND o.EventDate >= DATEADD(DAY,-30,GETDATE())
LEFT JOIN _Click c ON c.SubscriberKey = sub.SubscriberKey AND c.EventDate >= DATEADD(DAY,-30,GETDATE())
WHERE sub.Status = 'Active' AND (o.SubscriberKey IS NOT NULL OR c.SubscriberKey IS NOT NULL);
