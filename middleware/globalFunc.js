function setErrorMessage(req, res, next) {
    const errorMessage = req.query.error;
    res.locals.errorMessage = errorMessage;
    next();
}

function locals(req, res, next){
    // res.locals.username = req.session.username;
    res.locals.currentPath = req.path;
    next();
  }

module.exports = {setErrorMessage,locals};