select top 1 with ties
  b.bounceCategory
, b.sendid
from _bounce b
order by row_number() over (partition by b.bounceCategory order by newid())
/* list all of the bounce categories and return */
/* a random sendid/jobid associated with each one */