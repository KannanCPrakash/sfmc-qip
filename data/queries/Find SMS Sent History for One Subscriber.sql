SELECT
MessageID,
KeywordID,
Sent,
Delivered,
Undelivered,
ActionDateTime,
MessageText,
SMSStandardStatusCodeId,
Description,
Name
FROM _SMSMessageTracking

WHERE mobile = ''
AND ActionDateTime > DATEADD(d, -90, GETDATE())
