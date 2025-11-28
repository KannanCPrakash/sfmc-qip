-- Detect obviously invalid emails
SELECT *
FROM _Subscribers
WHERE EmailAddress NOT LIKE '%@%.__%'
   OR EmailAddress LIKE '%..%'
   OR EmailAddress LIKE '% %';
