var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

var indexRouter = require('./routes/index');
var apiRouter = require('./api/index')
var userRouter = require('./api/user')

const { Pool } = require('pg');

var app = express();

process.env.SECRET = 'mysecretkey';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    pool.query('SELECT * FROM users WHERE id = $1', [jwt_payload.sub], (err, result) => {
      if (err) {
        return done(err, false);
      }
      if (result.rows.length > 0) {
        return done(null, result.rows[0]);
      } else {
        return done(null, false);
      }
    });
  })
);

app.use(cors())


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api',apiRouter)
app.use('/api/user',userRouter)


module.exports = app;
