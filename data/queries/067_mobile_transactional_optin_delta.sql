-- Newly opted-in transactional subs in last 7 days
SELECT SubscriberKey, MobileNumber, TransactionalOptInDate
FROM MC_subscribers_sms_data_view
WHERE TransactionalOptIn = 1 AND TransactionalOptInDate >= DATEADD(DAY,-7,GETDATE());
