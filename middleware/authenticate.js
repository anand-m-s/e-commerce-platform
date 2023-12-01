const authMiddleware = (req, res, next) => {
    if (req.session.userId) {
        // User is authenticated, proceed to the next middleware
        next();
    } else {
        // User is not authenticated, redirect to the login page or send an unauthorized response
        res.redirect('/login'); // or res.status(401).send('Unauthorized');
    }
};

module.exports = authMiddleware;    