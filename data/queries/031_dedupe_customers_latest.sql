-- Keep latest record per CustomerID in CustomersDE
SELECT *
FROM (
    SELECT t.*,
           ROW_NUMBER() OVER (PARTITION BY CustomerID ORDER BY ModifiedDate DESC) AS rn
    FROM CustomersDE t
) x
WHERE rn = 1;
