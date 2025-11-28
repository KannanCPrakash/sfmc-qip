SELECT TOP 100
  SUBSTRING(Email, CHARINDEX( '@', Email) + 1, LEN(Email)) AS Domain
  , COUNT(*) as Count
 FROM COntact_Salesforce
 GROUP BY SUBSTRING(Email, CHARINDEX( '@', Email) + 1, LEN(Email))
 ODER BY COUNT(*) DESC
