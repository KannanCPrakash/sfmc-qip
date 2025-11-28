-- Landing page conversion (page view to order within 48h)
SELECT w.PageURL, COUNT(DISTINCT w.SubscriberKey) AS Visitors, COUNT(DISTINCT o.SubscriberKey) AS Converters
FROM WebEventsDE w
LEFT JOIN OrdersDE o
  ON o.SubscriberKey = w.SubscriberKey
 AND o.OrderDate BETWEEN w.EventDate AND DATEADD(HOUR,48,w.EventDate)
GROUP BY w.PageURL
ORDER BY Converters DESC;
