-- Soft vs Hard bounces (rough by Subcategory)
SELECT
  CASE WHEN BounceSubcategory IN ('Block','Other') THEN 'Soft' ELSE 'Hard' END AS BounceClass,
  COUNT(*) AS Events
FROM _Bounce
WHERE EventDate >= DATEADD(MONTH,-1,GETDATE())
GROUP BY CASE WHEN BounceSubcategory IN ('Block','Other') THEN 'Soft' ELSE 'Hard' END
ORDER BY Events DESC;
