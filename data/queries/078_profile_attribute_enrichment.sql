-- Enrich Subscribers from ProfileDE
SELECT s.SubscriberKey, s.EmailAddress, p.FirstName, p.LastName, p.Country
FROM _Subscribers s
LEFT JOIN ProfileDE p ON p.SubscriberKey = s.SubscriberKey;
