select
  s.SubscriberID
, s.SubscriberKey
, s.Status
, s.EmailAddress
, s.DateUnsubscribed
, s.DateJoined
, s.DateUndeliverable
, b.businessUnitMID
, b.businessUnitName
from _subscribers s
outer apply (
    select 1 businessUnitMID, 'Business Unit Name 1' businessUnitName union all
    select 2 businessUnitMID, 'Business Unit Name 2' businessUnitName union all
    select 3 businessUnitMID, 'Business Unit Name 3' businessUnitName union all
    select 4 businessUnitMID, 'Business Unit Name 4' businessUnitName union all
    select 5 businessUnitMID, 'Business Unit Name 5' businessUnitName
) b
/* name: subscribers_all */
/* target: subscribers_all */
/* action: overwrite */