-- Refund rate by product
SELECT i.ProductID,
       COUNT(*) AS Sold,
       SUM(CASE WHEN r.RefundID IS NOT NULL THEN 1 ELSE 0 END) AS Refunded,
       SUM(CASE WHEN r.RefundID IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*),0) AS RefundRate
FROM OrderItemsDE i
LEFT JOIN RefundsDE r ON r.OrderItemID = i.ItemID
GROUP BY i.ProductID
ORDER BY RefundRate DESC;
