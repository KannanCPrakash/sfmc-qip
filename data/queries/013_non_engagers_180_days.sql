-- Active subscribers with no opens/clicks in the last 180 days
SELECT sub.SubscriberKey
FROM _Subscribers sub
LEFT JOIN _Open o  ON o.SubscriberKey = sub.SubscriberKey AND o.EventDate >= DATEADD(DAY,-180,GETDATE())
LEFT JOIN _Click c ON c.SubscriberKey = sub.SubscriberKey AND c.EventDate >= DATEADD(DAY,-180,GETDATE())
WHERE sub.Status = 'Active'
  AND o.SubscriberKey IS NULL
  AND c.SubscriberKey IS NULL;
