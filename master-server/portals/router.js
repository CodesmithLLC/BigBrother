

require('require-all')("../help-request/models");

var app = require("express").Router();
var browserify = require("browserify");

app.get("/",function(req,res,next){
  if(!req.user) return next();
  var roles = req.user.roles;
  for(var i=0,l=roles.length;i<l;i++){
    switch(roles[i]){
      case "student":
        return res.sendFile(__dirname+"/student-portal/client/index.html");
      case "teachers_assistant":
        return res.sendFile(__dirname+"/ta-portal/client/index.html");
    }
  }
  next();
});

app.get("/index.js",function(req,res,next){
  var roles = req.user.roles;
  for(var i=0,l=roles.length;i<l;i++){
    switch(roles[i]){
      case "student":
        return sendBrowserified("student",res,next);
      case "teachers_assistant":
        return sendBrowserified("ta",res,next);
    }
  }
  next();
});

function sendBrowserified(path,res,next){
  var b = browserify(__dirname+"/"+path+"/client/browser")
  .add(__root+"/help-request/browser/"+path)
  .add(__root+"/student-monitor/browser/"+path)
  .transform('browserify-css') //might use brfs for the templates
  .bundle();
  b.on("error",next);
  res
    .status(200)
    .set("Content-Type","application/javascript");
  b.pipe(res);
}

module.exports = app;
