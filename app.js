var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var User = require('./models/user');
var localStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
mongoose.connect('mongodb://localhost/auth_demo');

var app = express();
app.use(require('express-session')({
  secret: "Oh be a fine girl kiss me",
  resave: false,
  saveUninitialized: false
}));
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ROUTES

app.get('/', function(req, res) {
  res.render('home');
});

// show the sign-up form
app.get('/register', function(req, res) {
  res.render('register');
});

// add user to database
app.post('/register', function(req, res) {
  User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      return res.render("/register");
    } 
    passport.authenticate("local")(req, res, function() {
      res.redirect("/secret");
    });
  });
});

// show the login form
app.get('/login', function(req, res) {
  res.render('login');
});

// log in the user
app.post('/login', passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
  }), function(req, res) {
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get('/secret', isLoggedIn, function(req, res) {
  res.render('secret');
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

// LISTENER

app.listen(3000, function() {
  console.log("Listening on Port 3000...");
});