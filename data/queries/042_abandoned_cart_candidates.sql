-- Abandoned cart candidates (no order placed 24h after cart update)
SELECT c.SubscriberKey, c.CartID, c.UpdatedOn, c.CartTotal
FROM Ecom_Cart c
LEFT JOIN OrdersDE o
  ON o.SubscriberKey = c.SubscriberKey
 AND o.OrderDate BETWEEN c.UpdatedOn AND DATEADD(HOUR,24,c.UpdatedOn)
WHERE o.OrderID IS NULL;
