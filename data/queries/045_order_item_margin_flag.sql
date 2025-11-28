-- Flag low-margin items (requires UnitPrice vs Cost in DE)
SELECT oi.*,
       CASE WHEN (oi.UnitPrice - oi.UnitCost) / NULLIF(oi.UnitPrice,0) < 0.1 THEN 1 ELSE 0 END AS LowMargin
FROM OrderItemsDE oi;
