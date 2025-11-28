-- Repeat buyers in last 12 months
SELECT o.SubscriberKey, COUNT(*) AS OrdersLast12M
FROM OrdersDE o
WHERE o.OrderDate >= DATEADD(MONTH,-12,GETDATE())
GROUP BY o.SubscriberKey
HAVING COUNT(*) >= 2;
