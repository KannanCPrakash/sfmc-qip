SELECT top 5000
    SUBSTRING ([Email], CHARINDEX( '@', [Email]) + 1, LEN([Email])) AS [Domain],
    COUNT(Email) AS Total

FROM DATA_EXTENSION_NAME
GROUP BY
    SUBSTRING ([Email], CHARINDEX( '@', [Email]) + 1, LEN([Email]))
order by COUNT(Email) DESC
