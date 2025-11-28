-- Remove duplicates example into a clean DE
SELECT *
FROM (
  SELECT
    *
  , ROW_NUMBER() OVER (PARTITION BY SubscriberKey ORDER BY ModifiedDate DESC) AS rn
  FROM SourceDE
) x
WHERE rn = 1;
