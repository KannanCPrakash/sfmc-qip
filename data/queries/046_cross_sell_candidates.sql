-- Cross-sell: buyers of Product A who never bought Product B
SELECT DISTINCT o.SubscriberKey
FROM OrdersDE o
JOIN OrderItemsDE i ON i.OrderID = o.OrderID AND i.ProductID = 'PROD_A'
WHERE NOT EXISTS (
    SELECT 1
    FROM OrdersDE o2
    JOIN OrderItemsDE i2 ON i2.OrderID = o2.OrderID AND i2.ProductID = 'PROD_B'
    WHERE o2.SubscriberKey = o.SubscriberKey
);
