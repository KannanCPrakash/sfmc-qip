SELECT
p.emailaddress,
p.accountid,
a.appointmentstart,
a.status,
a.physicianname,
a.npi,
l.status as liststatus
FROM [Physician Moved Offices] p

LEFT JOIN (SELECT 
        a1.appointmentstart,
        a1.status,
        a1.physicianname,
        a1.npi,
        a1.accountid,
        row_number()
            over ( partition by a1.accountid, a1.npi 
                order by a1.appointmentstart desc ) as RowNum
         FROM   Master_ActualAppointmentsEncounters a1 
         WHERE a1.npi IN ('1093773970','1265953954','1316038847')
         AND a1.appointmentstart > '12/31/2018'
         ) a
ON p.AccountID = a.AccountID
AND a.rownum = 1

LEFT JOIN _ListSubscribers l
ON p.contactid = l.subscriberkey
AND l.listid = '117'

WHERE p.emailaddress not in (SELECT e.emailaddress FROM [Phy Moved Office EPIC] e) 
