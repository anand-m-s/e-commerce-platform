const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const uuid = require('uuid').v4;
const bodyParser = require("body-parser");
const path = require('path');
const logger = require('morgan');
const db = require("./config/connection")
const indexRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
// const cors = require('cors')

const app = express();
const sessionSecret = uuid();

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// // Enable CORS for all routes
// app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: sessionSecret, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Get port from environment and store in Express
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Listen on provided port, on all network interfaces
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
