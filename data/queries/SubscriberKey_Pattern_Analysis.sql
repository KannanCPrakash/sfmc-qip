SELECT
    SubscriberKey,
    CASE
        WHEN stringLength > 5 AND  emailAddressTest = 'TRUE'    THEN 'EmailAddress'
        WHEN accountIDFormatTest = 'TRUE'                       THEN 'AccountID'
        WHEN contactIDFormatTest = 'TRUE'                       THEN 'ContactID'
        WHEN userIDormatTest = 'TRUE'                           THEN 'UserID'
        WHEN guidFormatTest = 'TRUE'                            THEN 'GUID'
        WHEN stringLength = 8 AND numeralsOnlyTest = 'TRUE'     THEN '8 Digit Number'
        WHEN stringLength = 9 AND numeralsOnlyTest = 'TRUE'     THEN '9 Digit Number'
        WHEN stringLength = 10 AND numeralsOnlyTest = 'TRUE'    THEN '10 Digit Number'
        WHEN stringLength = 32 AND numeralsOnlyTest = 'TRUE'    THEN '32 Digit Number'
        WHEN numeralsOnlyTest = 'TRUE'                          THEN 'NumbersOnly'    
       ELSE 'Other'
    END AS SubKeyClassification
FROM
    (
        SELECT
            SubscriberKey,
            LEN(SubscriberKey) AS stringLength,
            CASE WHEN LEN(SubscriberKey)=18 AND SUBSTRING(SubscriberKey,1,3) IN ('001', '003', '005') THEN 'TRUE' ELSE 'FALSE'  END AS crmFormatTest,           
            CASE WHEN LEN(SubscriberKey)=18 AND SUBSTRING(SubscriberKey,1,3) = '001' THEN 'TRUE' ELSE 'FALSE'                   END AS accountIDFormatTest,
            CASE WHEN LEN(SubscriberKey)=18 AND SUBSTRING(SubscriberKey,1,3) = '003' THEN 'TRUE' ELSE 'FALSE'                   END AS contactIDFormatTest,
            CASE WHEN LEN(SubscriberKey)=18 AND SUBSTRING(SubscriberKey,1,3) = '005' THEN 'TRUE' ELSE 'FALSE'                   END AS userIDormatTest,
            CASE WHEN SubscriberKey LIKE '________-____-____-____-____________' THEN 'TRUE' ELSE 'FALSE'                        END AS guidFormatTest,
            CASE WHEN SubscriberKey LIKE '%_@__%.__%' THEN 'TRUE' ELSE 'FALSE'                                                  END AS emailAddressTest,
            CASE WHEN SubscriberKey NOT LIKE '%[^a-zA-Z]%' THEN 'TRUE' ELSE 'FALSE'                                             END AS alphabetsOnlyTest,
            CASE WHEN SubscriberKey NOT LIKE '%[^0-9]%' THEN 'TRUE' ELSE 'FALSE'                                                END AS numeralsOnlyTest,
            CASE WHEN SubscriberKey LIKE '%[a-zA-Z0-9]%' THEN 'TRUE' ELSE 'FALSE'                                               END AS alphaNumericTest,
            CASE WHEN SubscriberKey LIKE '%[^0-9A-Za-z]%' THEN 'TRUE' ELSE 'FALSE'                                              END AS specialCharactersTest
        FROM
            AllSfmcContacts_MobileList
    ) AS x
