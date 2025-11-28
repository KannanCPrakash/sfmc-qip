-- Activity counts by Journey version
SELECT j.JourneyName,
       j.VersionNumber,
       ja.ActivityType,
       COUNT(*) AS ActivityCount
FROM _Journey j
JOIN _JourneyActivity ja ON ja.VersionID = j.VersionID
GROUP BY j.JourneyName, j.VersionNumber, ja.ActivityType
ORDER BY j.JourneyName, j.VersionNumber;
