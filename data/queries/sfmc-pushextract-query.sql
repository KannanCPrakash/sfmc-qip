SELECT
    CASE 
    WHEN MessageName LIKE 'push_%_20230%' THEN
        'Generic Push 1'
    WHEN MessageName = 'push2' THEN
        'push2'
    END as Type
,   MessageName
,   AppName AS OS
,   Month(DateTimeSend) AS Month
,   Count(P.ContactKey) AS SumSends
,   SUM(CASE WHEN P.Status = 'Success' THEN 1 ELSE 0 END) AS SumDelivery
FROM PushExtract P
WHERE AppName = 'App Android'
    AND (MessageName LIKE 'push_%_20230%'
        OR MessageName = 'push2'
    ) AND MessageName NOT LIKE '%_teste%'
    AND Month(DateTimeSend) = Month('2023-05-01')
GROUP BY MessageName, Month(DateTimeSend), AppName