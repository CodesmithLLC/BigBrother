var express = require("express");
var browserify = require("browserify");

var app = express();

app.get("/one.js",function(req,res,next){
  var b = browserify("./browser/a.js")
  .transform('brfs')
  .transform({global: true}, 'uglifyify')
  .bundle();
  b.on("error",next);
  res
    .status(200)
    .set("Content-Type","application/javascript");
  b.pipe(res);
});
app.get("/two.js",function(req,res,next){
  var b = browserify("./browser/ta")
  .transform('brfs') //might use brfs for the templates
  .bundle();
  b.on("error",next);
  res
    .status(200)
    .set("Content-Type","application/javascript");
  b.pipe(res);
});

app.listen(8000);
