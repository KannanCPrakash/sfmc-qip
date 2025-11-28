SELECT
  s.SubscriberKey
  , MAX(s.eventdate) AS eventdate,
  , COALESCE(j.EmailName,ja.activityname) AS EmailName,
  , s.jobid,
  , jy.JourneyName,
  , COUNT(s.eventdate) as Count

FROM _Sent s

LEFT JOIN _Job j
ON s.jobid = j.jobid

JOIN _JourneyActivity ja 
ON s.TriggererSendDefinitionObjectID = ja.JourneyActivityObjectID

JOIN _Journey jy
ON ja.VersionID = jy.VersionID

WHERE s.eventdate >= DATEADD(d,-7,GETDATE())
AND s.subscriberKEy IS NOT NULL
AND s.jobid is not null

GROUP BY 
  s.SubscriberKey
  , COALESCE(j.EmailName,ja.activityname)
  , s.jobid
  , jy.JourneyName
