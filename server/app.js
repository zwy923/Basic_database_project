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

/*const mongoose = require("mongoose")
const mongoDB = "mongodb+srv://zwy923:zhangwenyue@atlascluster.oepjzvv.mongodb.net/test"
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db = mongoose.connection
db.on("error",console.error.bind(console,"MongoDB connection error."))*/

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: '0923',
  port: 5432,
});

pool.query('SELECT * FROM account', (error, result) => {
  if (error) {
    console.error(error);
  } else {
    console.log(result.rows);
  }
});



var app = express();

process.env.SECRET = 'mysecretkey';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET
};

passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.sub, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
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
