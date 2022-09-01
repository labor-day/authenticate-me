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
const routes = require('./routes');

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

//connect routers to server
app.use(routes);

/******* EXPORT THE APP *******/
module.exports = app;
