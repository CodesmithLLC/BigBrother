var app = require("express").Router();
var browserify = require("browserify");

app.get("/",function(req,res,next){
  if(!req.user) return next();
  if(req.user.roles.indexOf("student") === -1) return next();
  res.sendFile(__dirname+"/browser/index.html");
});

app.get("/index.js",function(req,res,next){

});
