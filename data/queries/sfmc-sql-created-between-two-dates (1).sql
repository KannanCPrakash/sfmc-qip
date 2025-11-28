select
emailAddress
from [dataExtension]
where s.createdDate >= cast('2013-03-19' as date)
and s.createdDate <= cast('2013-04-19' as date)