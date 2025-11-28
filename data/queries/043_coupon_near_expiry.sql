-- Coupons expiring in 7 days
SELECT CouponCode, SubscriberKey, ExpiresOn
FROM Coupon_Issuance
WHERE ExpiresOn BETWEEN GETDATE() AND DATEADD(DAY,7,GETDATE());
