-- Push platform version counts
SELECT Platform, PlatformVersion, COUNT(*) AS Devices
FROM MC_push_address_data_view
GROUP BY Platform, PlatformVersion
ORDER BY Devices DESC;
