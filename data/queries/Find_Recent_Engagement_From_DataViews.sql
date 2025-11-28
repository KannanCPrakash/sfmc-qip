SELECT y.subscriberkey
       , y.eventdate
       , y.emailname
       , y.jobid
       , y.journeyname
       , COALESCE(y.opendate, y.clickdate) AS 'opendate'
       , y.clickdate
FROM   (SELECT s.subscriberkey
               , Max(s.eventdate) AS eventdate
               , COALESCE(j.emailname, ja.activityname) AS EmailName
               , s.jobid
               , jy.journeyname
               , (SELECT Max(o.eventdate) AS 'opendate'
                    FROM   _open o
                    WHERE  s.subscriberkey = o.subscriberkey
                       AND s.jobid = o.jobid
                       AND o.eventdate >= Dateadd(d, -30, Getdate())
                    GROUP  BY o.subscriberkey
                          ,  o.jobid
                          ) AS 'opendate'
               , (SELECT Max(c.eventdate) AS 'clickdate'
                    FROM   _click c
                    WHERE  s.subscriberkey = c.subscriberkey
                       AND s.jobid = c.jobid
                       AND c.eventdate >= Dateadd(d, -30, Getdate())
                      GROUP  BY c.subscriberkey
                            , c.jobid
                            ) AS 'clickdate'
        FROM _sent s
               LEFT JOIN _job j
                      ON s.jobid = j.jobid
               
               JOIN _journeyactivity ja
                 ON s.triggerersenddefinitionobjectid = ja.journeyactivityobjectid
               
               JOIN _journey jy
                 ON ja.versionid = jy.versionid
        
        WHERE  s.eventdate >= Dateadd(d, -30, Getdate())
               AND s.subscriberkey IS NOT NULL
               AND s.jobid IS NOT NULL
        
        GROUP  BY s.subscriberkey,
                  COALESCE(j.emailname, ja.activityname),
                  s.jobid,
                  jy.journeyname
                  ) y
WHERE  y.opendate IS NOT NULL
        OR y.clickdate IS NOT NULL 
