-- UTM campaign performance (requires utm fields)
SELECT utm_campaign,
       COUNT(*) AS Sessions,
       SUM(CASE WHEN o.OrderID IS NOT NULL THEN 1 ELSE 0 END) AS Orders
FROM WebEventsDE w
LEFT JOIN OrdersDE o ON o.SubscriberKey = w.SubscriberKey
GROUP BY utm_campaign
ORDER BY Orders DESC;
