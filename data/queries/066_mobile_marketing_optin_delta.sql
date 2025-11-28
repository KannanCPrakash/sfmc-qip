-- Newly opted-in mobile marketing subs in last 7 days
SELECT SubscriberKey, MobileNumber, MarketingOptInDate
FROM MC_subscribers_sms_data_view
WHERE MarketingOptIn = 1 AND MarketingOptInDate >= DATEADD(DAY,-7,GETDATE());
