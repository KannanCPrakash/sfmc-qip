SELECT subscriberkey
       , mobile
       , actiondatetime
       , SMSStandardStatusCodeId
       , description
        , Getdate() AS DateAdded
        , BounceCount
        , HoldDate
        , FirstBounceDate
FROM   
    (SELECT S.subscriberkey
               , S.mobile
               , S.undelivered
               , S.SMSStandardStatusCodeId
               , S.description
               , S.actiondatetime
               , u.BounceCount
               , u.HoldDate
               , u.FirstBounceDate
               , Row_number()
                 OVER (
                   partition BY S.subscriberkey
                   ORDER BY actiondatetime DESC) AS seqnum
        FROM   _smsmessagetracking S
        
        LEFT JOIN _UndeliverableSms u
        ON s.Mobile = u.MobileNumber
        
        WHERE  S.subscriberkey IS NOT NULL
               AND S.mobile IS NOT NULL
               AND S.actiondatetime >= Dateadd(hour, -3, Getdate())
               AND S.SMSStandardStatusCodeId in (SELECT Code FROM ENT.BounceSuppressionCodes)
               /* Create a DE with the following codes (2502, 4500, 4501, 4502, 4503, 4504, 4504) */
        ) A
WHERE  seqnum = 1
       AND undelivered = 1 
