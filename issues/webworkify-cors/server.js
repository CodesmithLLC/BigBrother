var express = require("express");
var browserify = require("browserify");
var open = require("open");

var app = express();

app.get("/one.js",function(req,res,next){
  var b = browserify("./a.js")
  .bundle();
  b.on("error",next);
  res
    .status(200)
    .set("Content-Type","application/javascript");
  b.pipe(res);
});

app.get("/",function(req,res,next){
  res.sendFile(__dirname+"/a.html");
});

app.get("/hello",function(req,res,next){
  res.send("hello");
});


app.listen(8000,function(){
  open("http://localhost:8000");
});
