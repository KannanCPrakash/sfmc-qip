-- Mobile carrier distribution
SELECT SmsCarrierName, COUNT(*) AS Subscribers
FROM MC_subscribers_sms_data_view
GROUP BY SmsCarrierName
ORDER BY Subscribers DESC;
