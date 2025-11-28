-- Active push devices by platform
SELECT Platform, COUNT(*) AS Devices
FROM MC_push_address_data_view
WHERE OptInStatusID IS NOT NULL AND Status = 'active'
GROUP BY Platform;
