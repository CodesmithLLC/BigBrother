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
        return sendBrowserified("student-portal",res,next);
      case "teachers_assistant":
        return sendBrowserified("ta-portal",res,next);
    }
  }
  next();
});

function sendBrowserified(path,res,next){
  var b = browserify(__dirname+"/"+path+"/client/browser")
  .transform('browserify-css') //might use brfs for the templates
  .bundle();
  b.on("error",next);
  res
    .status(200)
    .set("Content-Type","application/javascript");
  b.pipe(res);
}
