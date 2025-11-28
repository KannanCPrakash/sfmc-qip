  SELECT 
        c.ContactID,
        c.Email,
        c.RegistrationDate,
        c.Name
    FROM Contacts c
        CROSS JOIN TimeControl t
    WHERE 
        c.RegistrationDate BETWEEN c.LastProcessingTimeStamp AND GETDATE()