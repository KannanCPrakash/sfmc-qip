SELECT TOP 100
SUBSTRING(EmailAddress, 0, CHARINDEX( '@', EmailAddress) ) AS Common,
COUNT(*) AS Total
FROM ENT.NotSent

WHERE Reason = 'List Detective Exclusion'

GROUP BY SUBSTRING(EmailAddress, 0, CHARINDEX( '@', EmailAddress) )
ORDER BY COUNT(*) DESC
