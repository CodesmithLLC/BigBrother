var express = require("express"),
userController = require('./userController'),
passport = require("./passport.config.js");

var app = express.Router();


app.get("/login",function(req,res,next){
  //If a user exists, its not the user modules job to redirect it
  //Its the user modules job to not allow logging in
  if(req.user) return next();
  res.sendFile("./login.html");
});

app.post('/login', passport.authenticate('local-login'),function(req,res){
    console.log('in login', req.user);
    res.send(req.user);
});

// API-style endpoint for checking if logged in on all pages
app.get('/loggedin', function(req, res) {
  console.log('req.isAuthenticated()', req.user);
  res.send(req.isAuthenticated() ? req.user : '0');
});

app.post('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

//==================== Signup routes ============================

app.post('/checkUsernameExists', userController.checkUsernameExists);

app.post('/checkEmailExists', userController.checkEmailExists);

app.post('/signup', passport.authenticate('local-signup'),function(req,res){
    console.log('inside signup');
    console.log('req.body', req.user);
    res.send(req.user);
});


module.exports = app;
