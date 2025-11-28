-- CASE examples
SELECT SubscriberKey,
CASE WHEN BounceCount>0 THEN 'At Risk' ELSE 'Healthy' END AS Status
FROM _Subscribers;