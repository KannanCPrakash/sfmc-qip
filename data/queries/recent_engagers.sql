-- Recent engagers
SELECT DISTINCT SubscriberKey
FROM _Open
WHERE EventDate>=DATEADD(DAY,-30,GETDATE());