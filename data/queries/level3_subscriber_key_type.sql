-- Level 3 - LIKE, CASE, Strings
-- Classify SubscriberKey type (Email / Account / Contact / User / Lead / Other)
SELECT
      SubscriberKey
    , CASE
        WHEN SubscriberKey LIKE '%@%.%'                                 THEN 'Email'
        WHEN LEN(SubscriberKey) = 18 AND LEFT(SubscriberKey, 3) = '001' THEN 'Account'
        WHEN LEN(SubscriberKey) = 18 AND LEFT(SubscriberKey, 3) = '003' THEN 'Contact'
        WHEN LEN(SubscriberKey) = 18 AND LEFT(SubscriberKey, 3) = '005' THEN 'User'
        WHEN LEN(SubscriberKey) = 18 AND LEFT(SubscriberKey, 3) = '00Q' THEN 'Lead'
        ELSE 'Other'
      END AS SubscriberKeyType
FROM _Subscribers;
