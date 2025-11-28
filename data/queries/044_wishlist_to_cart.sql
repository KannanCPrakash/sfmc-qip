-- Wishlist items promoted to cart
SELECT w.SubscriberKey, w.ProductID, w.AddedOn
FROM Wishlist_Items w
JOIN Ecom_CartItems ci ON ci.ProductID = w.ProductID AND ci.CartID IN (
    SELECT CartID FROM Ecom_Cart WHERE UpdatedOn >= DATEADD(DAY,-7,GETDATE())
);
