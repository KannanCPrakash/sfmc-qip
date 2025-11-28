select
s.[SubscriberKey] [Subscriber Key]
, s.EmailAddress [Email Address]
, case
    when r.RegionID = '1' then 'Omaha'
    when r.RegionID = '2' then 'Kansas City'
    when r.RegionID = '4' then 'Texas'
    else 'Online'
 end as [Store Location]
, isnull(r.RegionId,'0') RegionID
from Master_Subscribers s with (nolock)
left join RegionID_ZipCodes r on (r.ZipCode = s.[Zip Code])