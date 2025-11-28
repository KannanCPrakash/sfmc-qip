select
a.customerID
, s.emailAddress
from EnterpriseAttributes a
inner join _Subscribers s on (s.subscriberID = a.subscriberID)