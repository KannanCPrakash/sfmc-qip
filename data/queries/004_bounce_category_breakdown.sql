-- Bounce categories
SELECT
  b.BounceCategory,
  b.BounceType,
  COUNT(*) AS Events
FROM _Bounce b
WHERE b.EventDate >= DATEADD(MONTH,-1,GETDATE())
GROUP BY b.BounceCategory, b.BounceType
ORDER BY Events DESC;
