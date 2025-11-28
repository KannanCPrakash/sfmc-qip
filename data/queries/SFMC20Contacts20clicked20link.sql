SELECT
    DISTINCT c.SubscriberKey as 'ContactCID',
    s.EmailAddress
FROM
    _Click c WITH (NOLOCK)
    INNER JOIN (
        SELECT
            JobID,
            EmailName
        FROM
            _Job
    ) j ON j.JobID = c.JobID
    LEFT JOIN ent._Subscribers s ON c.SubscriberKey = s.SubscriberKey
WHERE
    (
        j.EmailName = 'nameOfEmail01'
        OR j.EmailName = 'nameOfEmail02'
    )
    AND c.LinkName = 'linkAlias'
    AND CAST(c.EventDate AS DATE) > '2021-04-04'