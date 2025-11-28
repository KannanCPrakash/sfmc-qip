select
  s.SubscriberKey
, s.Event
, s.EventDate
, s.Journey
from Journey_Builder_Status s
/* name: Journey_Builder_Log */
/* target: Journey_Builder_Log */
/* action: Update */