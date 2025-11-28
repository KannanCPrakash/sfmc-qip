select top 25 percent 
  de1.field1
, de1.field2
from [dataextension1] de1
left join [dataextensionsplit_1] split1 on split1.[email address] = de1.[email address]
where 1=1
and split1.[email address] is null
order by newid()
/* writes to dataextensionsplit_2 */