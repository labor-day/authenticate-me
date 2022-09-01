/********* IMPORT PACKAGES/DEPENDENCIES *********/
const express = require('express'); //server
require('express-async-errors'); //async route handler
const morgan = require('morgan'); //logger
const cors = require('cors'); //cross origin resource sharing
const csurf = require('csurf'); //cross site request forgery protection
const helmet = require('helmet'); //security middleware
const cookieParser = require('cookie-parser'); //parse cookies
const { environment } = require('./config'); //get env variables from config folder
const isProduction = environment === 'production'; //check if environment is production
const routes = require('./routes'); //import route handlers
const { ValidationError } = require('sequelize'); // catch sequelize errors

/********* INITIALIZE SERVER *********/
const app = express();

/******** MIDDLEWARE *********/
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

//only use cors in development environment
if (!isProduction) {
  app.use(cors());
}

//allows images with URLS to render
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);

// Connect routers to server
app.use(routes);

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = ["The requested resource couldn't be found."];
  err.status = 404;
  next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    err.errors = err.errors.map((e) => e.message);
    err.title = 'Validation error';
  }
  next(err);
});

// Last error handler formats all errors before returning response
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack
  });
});

/******* EXPORT THE APP *******/
module.exports = app;
