-- Orders by acquisition channel (if tracked in Subscribers)
SELECT sub.AcquisitionChannel, COUNT(*) AS Orders
FROM OrdersDE o
JOIN _Subscribers sub ON sub.SubscriberKey = o.SubscriberKey
GROUP BY sub.AcquisitionChannel
ORDER BY Orders DESC;
