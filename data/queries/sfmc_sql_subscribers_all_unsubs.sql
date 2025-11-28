select
  u.BusinessUnitID businessUnitMID
, u.SubscriberKey
, u.subscriberId
, 'unsubscribed' Status
, u.UnsubDateUTC DateUnsubscribed
, case
    when u.businessUnitID = 1 then 'Business Unit Name 1'
    when u.businessUnitID = 2 then 'Business Unit Name 2'
    when u.businessUnitID = 3 then 'Business Unit Name 3'
    when u.businessUnitID = 4 then 'Business Unit Name 4'
    when u.businessUnitID = 5 then 'Business Unit Name 5'
 end businessUnitName
FROM _BusinessUnitUnsubscribes u
/* name: subscribers_all_unsubs */
/* target: subscribers_all */
/* action: update */