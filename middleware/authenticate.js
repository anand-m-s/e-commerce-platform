const checkAuthentication = (req, res, next) => {
    if (req.session.userId) {
        next(); // User is authenticated, continue to the next middleware or route handler
    } else {
        res.redirect("/login"); // User is not authenticated, redirect to the login page
    }
};