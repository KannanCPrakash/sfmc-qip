Select
  de1.field1
, de1.field2
From [DataExtension1] de1
Left Join [DataExtensionSplit_1] split1 on split1.[Email Address] = de1.[Email Address]
Left Join [DataExtensionSplit_2] split2 on split2.[Email Address] = de1.[Email Address]
Where 1=1
and split1.[Email Address] Is Null
and split2.[Email Address] Is Null
/* writes to DataExtensionSplit_3 */