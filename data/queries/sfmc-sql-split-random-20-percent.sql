select top 20 percent
  de1.field1
, de1.field2
from [dataextension1] de1
order by newid()
/* writes to DataExtensionSplit_1 */