/* do not do this */
select
o.subscriberkey
from _open o
where 
cast(o.eventdate as date) = convert(date, getDate()-1)
and o.isunique = 1

/* do this instead */
select
o.subscriberkey
from _open o
where
o.eventdate >= convert(date, getDate()-1)
and o.eventdate < convert(date, getDate())
and o.isunique = 1