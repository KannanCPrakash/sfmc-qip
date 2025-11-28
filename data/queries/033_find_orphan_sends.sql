-- Sends without a corresponding Subscriber (orphaned)
SELECT s.*
FROM _Sent s
LEFT JOIN _Subscribers sub ON sub.SubscriberID = s.SubscriberID
WHERE sub.SubscriberID IS NULL;
