-- High LTV contacts (top 10%)
WITH totals AS (
  SELECT SubscriberKey, SUM(LineTotal) AS LTV
  FROM OrdersDE o
  JOIN OrderItemsDE i ON i.OrderID = o.OrderID
  GROUP BY SubscriberKey
),
ranked AS (
  SELECT SubscriberKey, LTV,
         NTILE(10) OVER (ORDER BY LTV DESC) AS decile
  FROM totals
)
SELECT * FROM ranked WHERE decile = 1;
