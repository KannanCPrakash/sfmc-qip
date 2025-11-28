SELECT
x.id,
x.Reason
FROM
(SELECT
z.id,
z.Reason,
row_number() over (partition by z.id order by z.Reason asc) AS ranking
FROM
(

SELECT
l.id,
'1 Converted' AS Reason
FROM Lead_Salesforce l
WHERE l.isconverted = 'true'

UNION 

SELECT 
a.subscriberkey as id,
'2 Not in Synced SF Data Extension' as Reason
FROM _Subscribers a
WHERE a.subscriberkey NOT IN (
            SELECT
            l1.id
            FROM Lead_Salesforce l1
            
            UNION

            SELECT
            c1.id 
            FROM Contact_Salesforce c1)
) z
) x
WHERE x.ranking = 1
