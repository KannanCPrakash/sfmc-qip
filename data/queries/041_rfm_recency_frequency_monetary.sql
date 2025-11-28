-- Simple RFM across OrdersDE and OrderItemsDE
WITH last_order AS (
    SELECT SubscriberKey, MAX(OrderDate) AS LastOrderDate
    FROM OrdersDE
    GROUP BY SubscriberKey
),
freq AS (
    SELECT SubscriberKey, COUNT(*) AS OrderCount
    FROM OrdersDE
    GROUP BY SubscriberKey
),
mon AS (
    SELECT o.SubscriberKey, SUM(oi.LineTotal) AS LifetimeValue
    FROM OrdersDE o
    JOIN OrderItemsDE oi ON oi.OrderID = o.OrderID
    GROUP BY o.SubscriberKey
)
SELECT s.SubscriberKey,
       DATEDIFF(DAY, lo.LastOrderDate, GETDATE()) AS RecencyDays,
       f.OrderCount AS Frequency,
       m.LifetimeValue AS Monetary
FROM _Subscribers s
LEFT JOIN last_order lo ON lo.SubscriberKey = s.SubscriberKey
LEFT JOIN freq f       ON f.SubscriberKey  = s.SubscriberKey
LEFT JOIN mon m        ON m.SubscriberKey  = s.SubscriberKey;
