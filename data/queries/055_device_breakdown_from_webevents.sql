-- Very rough device breakdown via User-Agent parsing example (if captured in a DE)
SELECT
  CASE
    WHEN UserAgent LIKE '%iPhone%' OR UserAgent LIKE '%Android%' THEN 'Mobile'
    WHEN UserAgent LIKE '%iPad%' THEN 'Tablet'
    WHEN UserAgent LIKE '%Windows%' OR UserAgent LIKE '%Macintosh%' THEN 'Desktop'
    ELSE 'Other'
  END AS DeviceType,
  COUNT(*) AS Events
FROM WebEventsDE
GROUP BY CASE
    WHEN UserAgent LIKE '%iPhone%' OR UserAgent LIKE '%Android%' THEN 'Mobile'
    WHEN UserAgent LIKE '%iPad%' THEN 'Tablet'
    WHEN UserAgent LIKE '%Windows%' OR UserAgent LIKE '%Macintosh%' THEN 'Desktop'
    ELSE 'Other'
  END
ORDER BY Events DESC;
