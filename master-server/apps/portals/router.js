var app = require("express").Router();
var sendBrowserified = require("../../Abstract/std-browserify");

app.get("/",function(req,res,next){
  if(!req.user) return next();
  var roles = req.user.roles;
  for(var i=0,l=roles.length;i<l;i++){
    switch(roles[i]){
      case "student":
        return res.sendFile(__dirname+"/browser/student/index.html");
      case "teachers_assistant":
        return res.sendFile(__dirname+"/browser/ta/index.html");
    }
  }
  next();
});

app.get("/index.js",function(req,res,next){
  if(!req.user) return next();
  var roles = req.user.roles;
  for(var i=0,l=roles.length;i<l;i++){
    switch(roles[i]){
      case "student":
        return sendBrowserified(__dirname+"/browser/student/index.js",res,next);
      case "teachers_assistant":
        return sendBrowserified(__dirname+"/browser/ta/index.js",res,next);
    }
  }
  next();
});

module.exports = app;
