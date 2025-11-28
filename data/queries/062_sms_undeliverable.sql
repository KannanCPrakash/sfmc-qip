-- Undeliverable SMS numbers
SELECT MobileNumber, FirstBounceDate, HoldDate
FROM MC_undeliverable_sms_data_view
WHERE Undeliverable = 1;
