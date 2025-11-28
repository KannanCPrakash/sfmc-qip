SELECT TOP 100
z.SMSStandardStatusCodeId
               , z.description
               , z.EventDate
               , z.total
FROM
(SELECT S.SMSStandardStatusCodeId
               , S.description
               , CAST(S.actiondatetime AS DATE) as EventDate
               , COUNT(s.mobile) as total
        FROM   _smsmessagetracking S

        WHERE S.actiondatetime >= DATEADD(d, -7, GETDATE())
        GROUP BY 
                S.SMSStandardStatusCodeId
               , S.description
               , CAST(S.actiondatetime AS DATE)
) z
ORDER BY z.EventDate desc, z.SMSStandardStatusCodeId asc
