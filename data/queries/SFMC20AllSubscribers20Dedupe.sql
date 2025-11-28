--It queries the latest consent status on the ContactPointTypeConsent object in Salesforce and updates AllSubscribers List

SELECT
    s.SubscriberKey,
    s.HasOptedOutOfEmail,
    s.EmailAddress,
    s.Status
FROM
    (
        SELECT
            consent.Contact__c as SubscriberKey,
            consent.PrivacyConsentStatus as 'HasOptedOutOfEmail',
            consent.EffectiveFrom,
            allsubs.EmailAddress as EmailAddress,
            CASE
                WHEN consent.PrivacyConsentStatus = 'OptOut' THEN 'Unsubscribed'
                ELSE 'Active'
            END AS 'Status',
            ROW_NUMBER() OVER (
                PARTITION BY Contact__c
                ORDER BY
                    EffectiveFrom DESC
            ) AS Row
        FROM
            ent.ContactPointTypeConsent_Salesforce as consent with (nolock)
            INNER JOIN ent._subscribers as allsubs with (nolock) ON consent.Contact__c = allsubs.SubscriberKey
        WHERE
            consent.EngagementChannelTypeName__c = 'Primary Email'
            AND (
                consent.DataUsePurposeId = '0ZW5r000000Kz52GAC'
                OR consent.DataUsePurposeId = '0ZW5r000000Kz65GAC'
            )
    ) AS s
WHERE
    row = 1