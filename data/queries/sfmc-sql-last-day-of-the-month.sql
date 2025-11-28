select
createdDate
from [dataExtension]
where
dateadd(dd,datediff(dd,0,createdDate), 0) =
dateadd(d, -1, dateadd(m,datediff(m,0,dateadd(dd,datediff(dd,0,getDate()), 0))+1,0))