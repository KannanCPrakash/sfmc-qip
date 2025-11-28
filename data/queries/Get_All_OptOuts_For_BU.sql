SELECT 
    MobileNumber
    , max(OptOutDate) as OptOutDate
FROM _SMSSubscriptionLog
WHERE
    OptOutStatusID = 1
    and OptInStatusID = 0
group by MobileNumber
