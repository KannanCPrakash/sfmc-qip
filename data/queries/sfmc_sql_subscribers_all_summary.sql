select
  s.businessUnitMID
, s.businessUnitName
, s.status
, count(*) count
from subscribers_all s
group by
  s.businessUnitMID
, s.businessUnitName
, s.status
/* name: subscribers_all_summary */
/* target: subscribers_all_summary */
/* action: overwrite */