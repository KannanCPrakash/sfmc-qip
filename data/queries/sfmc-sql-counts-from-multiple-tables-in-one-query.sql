select 
  de1.count1
, de2.count2
from (
  select count(*) as count1
  from DataExtension1
) as de1
cross join (
  select count(*) as count2
  from DataExtension2
) as de2   