-- Simple engagement score over 90 days
SELECT s.SubscriberKey,
       SUM(CASE WHEN o.EventDate IS NOT NULL THEN 1 ELSE 0 END) * 1
     + SUM(CASE WHEN c.EventDate IS NOT NULL THEN 1 ELSE 0 END) * 3 AS Score
FROM _Subscribers s
LEFT JOIN _Open  o ON o.SubscriberKey = s.SubscriberKey AND o.EventDate  >= DATEADD(DAY,-90,GETDATE())
LEFT JOIN _Click c ON c.SubscriberKey = s.SubscriberKey AND c.EventDate >= DATEADD(DAY,-90,GETDATE())
GROUP BY s.SubscriberKey;
