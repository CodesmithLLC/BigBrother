var express = require("express"),
userModel = require("./UserModel"),
passport = require("./passport.config.js"),
bodyParser = require("body-parser");


var app = express.Router();


app.get("/login",function(req,res,next){
  //If a user exists, its not the user modules job to redirect it
  //Its the user modules job to not allow logging in
  if(req.user) return next();
  res.sendFile(__dirname+"/login.html");
});

app.post('/login',
  bodyParser(),
  passport.authenticate('local-login'),function(req,res,next){
    console.log('in login', req.user);
    res.redirect("/");
});

// API-style endpoint for checking if logged in on all pages
app.get('/loggedin', function(req, res) {
  console.log('req.isAuthenticated()', req.user);
  res.send(req.isAuthenticated() ? req.user : '0');
});

app.get('/logout', bodyParser(),function(req, res){
  console.log("logout");
  req.logout();
  res.redirect('/login');
});


app.post('/signup', bodyParser(), passport.authenticate('local-signup'),function(req,res){
    console.log('inside signup');
    console.log('req.body', req.user);
    res.send(req.user);
});


module.exports = app;
