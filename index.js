require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const expressJWT = require('express-jwt');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');

// App instance
const app = express();


// Set up middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
/* we use cors on the entire app for convienence, but basically needed any time
 * a route is connecting with the front end */
app.use(cors());
// do not accept "weird" data, also prevents a potential source of server crash
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false}));

// helper function: this allows our server to parse incoming token from client
function fromRequest(req){
  if(req.body.headers.Authorization &&
    req.body.headers.Authorization.split(' ')[0] === 'Bearer'){
    return req.body.headers.Authorization.split(' ')[1];
  }
  return null;
}


// Controllers
/* NOTE here we use the JWT middleware to protect relevant routes
 * you can see how we say "unless" to specify that we dont want it to run on
 * those, WARN it has access to request because it is middleware
 * so it has (req, res, next) implicitly */
app.use('/auth', expressJWT({
  secret: process.env.JWT_SECRET,
  getToken: fromRequest
}).unless({
  path: [
    { url: '/auth/login', methods: ['POST'] },
    { url: '/auth/signup', methods: ['POST'] }
  ]
}), require('./controllers/auth'));

// catch all route, ideally don't get here unless mistake made
// NOTE this should not be user error, this should be front-end dev error
app.get('*', function(req, res, next) {
  res.send({ message: 'Unknown Route' });
});

app.listen(process.env.PORT || 3000);
