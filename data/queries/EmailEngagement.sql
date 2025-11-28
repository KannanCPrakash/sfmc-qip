SELECT
y.SubscriberKey,
y.eventdate as SentDate,
y.EmailName,
y.jobid,
y.JourneyName,
COALESCE(y.opendate,y.clickdate) AS 'opendate',
y.clickdate

FROM
(SELECT
s.SubscriberKey,
MAX(s.eventdate) as eventdate,
LEFT(COALESCE(j.EmailName,ja.activityname),150) AS EmailName,
s.jobid,
COALESCE(LEFT(jy.JourneyName,150),'Nonjourney send') as JourneyName,
(SELECT MIN(o.eventdate) AS 'opendate' 
    FROM _Open o 
    WHERE s.subscriberkey = o.subscriberkey 
    AND s.jobid = o.jobid 
    AND o.eventdate >= DATEADD(d,-2,GETDATE())
    GROUP BY o.subscriberkey, o.jobid) AS 'opendate',
(SELECT MIN(c.eventdate) AS 'clickdate' 
    FROM _click c 
    WHERE s.subscriberkey = c.subscriberkey 
    AND s.jobid = c.jobid 
    AND c.eventdate >= DATEADD(d,-2,GETDATE())
    GROUP BY c.subscriberkey,c.jobid) AS 'clickdate'
FROM _Sent s

LEFT JOIN _Job j
ON s.jobid = j.jobid

left join [_JourneyActivity] ja 
on s.TriggererSendDefinitionObjectID = ja.JourneyActivityObjectID

left join [_Journey] jy
on ja.VersionID = jy.VersionID

WHERE s.eventdate >= DATEADD(d,-60,GETDATE())
AND s.subscriberKEy IS NOT NULL
AND s.jobid is not null

GROUP BY 
s.SubscriberKey,
COALESCE(j.EmailName,ja.activityname),
s.jobid,
jy.JourneyName
) y
WHERE (y.opendate IS NOT NULL
OR y.clickdate IS NOT NULL)
AND CONCAT(y.SubscriberKey,y.jobid,y.eventdate) NOT IN (SELECT CONCAT(z.SubscriberKey,z.jobid,z.sentdate) FROM EmailEngagement z)
