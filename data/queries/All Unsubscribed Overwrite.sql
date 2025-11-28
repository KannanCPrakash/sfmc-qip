SELECT
x.SubscriberKey,
x.EmailAddress,
x.UnsubscribedDate,
x.Source,
x.DateAdded
FROM
(
SELECT
z.SubscriberKey,
z.EmailAddress,
MAX(z.UnsubscribedDate) as UnsubscribedDate,
z.Source,
MIN(z.DateAdded) as DateAdded,
row_number() over (partition by z.emailaddress order by HasSubKey desc) AS ranking
FROM
( 
SELECT
CASE WHEN u.subscriberkey LIKE '%@%' THEN 0 ELSE 1 END as HasSubKey,
u.SubscriberKey,
u.EmailAddress,
u.UnsubscribedDate,
u.Source,
u.DateAdded
FROM Unsubscribed_Staging u

UNION

SELECT
CASE WHEN l.subscriberkey LIKE '%@%' THEN 0 ELSE 1 END as HasSubKey,
l.subscriberkey,
l.emailaddress,
getdate() as UnsubscribedDate,
'System' AS Source,
GETDATE() as DateAdded
FROM _ListSubscribers l
WHERE listid = '501'
AND l.status = 'Unsubscribed'

UNION

SELECT
0 as HasSubKey,
a.[email address] as SubscriberKey,
a.[email address] as emailaddress,
a.[date added] as UnsubscribedDate,
'Import' AS Source,
a.[date added] as DateAdded
FROM  [Unsubscribed from MailChimp] a
) z

GROUP BY 
z.SubscriberKey,
z.EmailAddress,
z.Source,
z.HasSubKey
) x

WHERE x.ranking = 1
