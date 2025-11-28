-- Push device timezone distribution
SELECT TimeZone, COUNT(*) AS Devices
FROM MC_push_address_data_view
GROUP BY TimeZone
ORDER BY Devices DESC;
