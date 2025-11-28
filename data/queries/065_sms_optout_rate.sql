-- SMS opt-out rate (subscription log)
SELECT
  COUNT(*) FILTER (WHERE OptOutDate IS NOT NULL) AS OptOuts -- ignore if filter not supported
FROM MC_sms_subscription_log;
