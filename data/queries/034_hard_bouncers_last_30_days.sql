-- Hard bouncers last 30 days
SELECT SubscriberKey, COUNT(*) AS HardBounces
FROM _Bounce
WHERE EventDate >= DATEADD(DAY,-30,GETDATE())
  AND BounceCategory = 'Hard bounce'
GROUP BY SubscriberKey
ORDER BY HardBounces DESC;
