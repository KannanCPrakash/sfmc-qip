select
emailAddress
from [dataExtension]
where createdDate < convert(date, getDate())
and createdDate >= convert(date, getDate()-30)