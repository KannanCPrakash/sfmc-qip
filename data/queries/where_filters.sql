-- WHERE filter examples
SELECT *
FROM _Sent
WHERE EventDate>=DATEADD(DAY,-7,GETDATE())
AND Domain='gmail.com';