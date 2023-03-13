var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

var indexRouter = require('./routes/index');
var apiRouter = require('./api/index')
var userRouter = require('./api/user')

const mongoose = require("mongoose")
const mongoDB = "mongodb+srv://zwy923:zhangwenyue@atlascluster.oepjzvv.mongodb.net/test"
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db = mongoose.connection
db.on("error",console.error.bind(console,"MongoDB connection error."))


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



/**这个cors顺序很重要 */

// SET NODE_ENV=development& npm run dev:server
if(process.env.NODE_ENV ==="development"){
    var corsOptions = {
        origin: "http://localhost:3000",
        methods: ["POST","DELETE","PUT","GET"],
        credentials: true,
        optionsSuccessStatus:200,
    };
    app.use(cors(corsOptions))
}else if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.resolve("..","client","build")))
    app.get("*",(req,res)=>
        res.sendFile(path.resolve("..","client","build","index.html"))
    )
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api',apiRouter)
app.use('/api/user',userRouter)


module.exports = app;
