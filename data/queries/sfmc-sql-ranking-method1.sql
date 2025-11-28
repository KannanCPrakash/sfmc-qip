select
  x.bounceCategory
, x.sendid
from (
  select
    b.bounceCategory
  , b.sendid
  , row_number() over (partition by b.bounceCategory order by newid()) ranking
  from _bounce b
) x 
where x.ranking = 1
/* list all of the bounce categories and return */
/* a random sendid/jobid associated with each one */