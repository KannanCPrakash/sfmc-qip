/*Data Extension Status*/
SELECT  top 100 dateadd(HOUR, 7, se.createddate) AS createddate_ESP,
        se.syncentityid AS [SyncEntityID],
        se.organization AS [Salesforce_OrgID],
        se.entitytype AS [EntityType],
        se.entitydisplayname AS [EntityDisplayName],
        ss.name AS [Name],
        se.status AS [Status],
        se.createddate AS [Created Date]
  FROM  dbo.syncentity(nolock) AS se
        LEFT JOIN dbo.syncstatus(nolock) AS ss ON se.status = ss.statusid
 WHERE  se.eid = '{{  mid  }}'
 ORDER  BY se.entitytype

/*Data Extension Field Status*/
SELECT  se.entitytype + '.' + sef.fieldname as entityfield,
        sef.fielddisplayname,
        ss.name as status,
        sef.externalfieldtype,
        sef.mid,
        sef.eid,
        sef.createddate
  FROM  dbo.syncentityfield AS sef (nolock)
        LEFT JOIN dbo.syncentity as se (nolock) ON sef.syncentityid = se.syncentityid
        LEFT JOIN dbo.syncstatus as ss (nolock) ON sef.status = ss.statusid
 WHERE  sef.eid = {{ mid }}
ORDER BY entityfield

