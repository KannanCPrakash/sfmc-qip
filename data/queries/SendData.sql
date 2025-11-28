SELECT
s.SubscriberKey,
MAX(s.eventdate) AS eventdate,
COALESCE(j.EmailName,ja.activityname) AS EmailName,
s.jobid,
jy.JourneyName,
COUNT(s.eventdate) as Count,
(SELECT TOP 1 j1.FromName FROM _Job j1 WHERE s.jobid = j1.jobid) AS FromName,
(SELECT TOP 1 j2.FromEmail FROM _Job j2 WHERE s.jobid = j2.jobid) AS FromEmail,
MIN(j.DeliveredTime) as DeliveredTime
FROM _Sent s

LEFT JOIN _Job j
ON s.jobid = j.jobid

join [_JourneyActivity] ja 
on s.TriggererSendDefinitionObjectID = ja.JourneyActivityObjectID

join [_Journey] jy
on ja.VersionID = jy.VersionID

WHERE s.eventdate >= DATEADD(d,-2,GETDATE())
AND s.subscriberKey IS NOT NULL
AND s.jobid is not null

GROUP BY 
s.SubscriberKey,
COALESCE(j.EmailName,ja.activityname),
s.jobid,
jy.JourneyName
