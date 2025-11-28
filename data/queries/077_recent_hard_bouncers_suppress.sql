-- Recent hard bouncers to suppress
SELECT DISTINCT b.SubscriberKey
FROM _Bounce b
WHERE b.EventDate >= DATEADD(DAY,-14,GETDATE())
  AND b.BounceCategory = 'Hard bounce';
