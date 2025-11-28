-- Naive session length estimate per Subscriber (requires SessionID and duration logic)
SELECT SubscriberKey, SessionID, MIN(EventDate) AS SessionStart, MAX(EventDate) AS SessionEnd,
       DATEDIFF(MINUTE, MIN(EventDate), MAX(EventDate)) AS SessionMinutes
FROM WebEventsDE
GROUP BY SubscriberKey, SessionID;
