-- SMS Opt-in in last 30 days (custom DE)
SELECT SubscriberKey, MobileNumber, MarketingOptInDate
FROM MC_subscribers_sms_data_view
WHERE MarketingOptIn = 1 AND MarketingOptInDate >= DATEADD(DAY,-30,GETDATE());
