-- Soft bouncers last 30 days
SELECT SubscriberKey, COUNT(*) AS SoftBounces
FROM _Bounce
WHERE EventDate >= DATEADD(DAY,-30,GETDATE())
  AND BounceCategory = 'Soft bounce'
GROUP BY SubscriberKey
ORDER BY SoftBounces DESC;
