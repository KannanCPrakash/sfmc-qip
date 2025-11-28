select
x.emailaddress
, x.subscriberkey
from (
  select
  w.emailaddress
  , w.subscriberkey
  , w.insertDate
  , row_number() over (partition by w.subscriberkey order by w.insertDate asc) ranking
  from Welcome_Trigger w
) x
where x.ranking = 1
and x.insertDate >= convert(date,getDate()-30)
and x.insertDate < convert(date,getDate()-29)