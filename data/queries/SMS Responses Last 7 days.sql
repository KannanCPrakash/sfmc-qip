SELECT TOP 6000
        S.MessageText
               , COUNT(s.mobile) as total
        FROM   _smsmessagetracking S

        WHERE S.actiondatetime >= DATEADD(d, -7, GETDATE())
        AND s.Inbound = 1
        GROUP BY S.MessageText
        ORDER BY COUNT(s.mobile) DESC
