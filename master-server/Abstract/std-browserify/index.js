var browserify = require("browserify");
var fs = require("fs");
var disc = require("disc");
var pu = require("path");
var JSONStream = require("JSONStream");
var kcode = {};

module.exports = function sendBrowserified(path,ops,res,next){
  if(!next){
    next = res;
    res = ops;
    ops = void 0;
  }
  var b = browserify(path,ops)
  .transform('brfs') //might use brfs for the templates
  .bundle()
  .on("error",next);
  res
    .status(200)
    .set("Content-Type","application/javascript");
  b.pipe(res);
  buildBrowserify(path);
};


function buildBrowserify(path){
  var name = path.split("/");
  name = name.slice(name.length-4).join("-");
  fs.stat(__dirname+"/dist/file-"+name+".disc.html",function(e){
    if(!e) return;
    var corners = {};
    var deps = JSONStream.stringify();
    deps.pipe(fs.createWriteStream(__dirname+"/dist/deps-"+name+".json"));
    var b = browserify(path,{fullPaths:true})
    .transform('brfs')
    .transform({
      global: true,
      sourcemap: false
    },'uglifyify')
    .on('dep', function (mod) {
      deps.write({id:mod.id,deps:mod.deps});
      Object.keys(mod.deps).forEach(function(k){
        if(!(mod.deps[k] in corners)){
          corners[mod.deps[k]] = [];
        }
        corners[mod.deps[k]].push(mod.id);
      });
    }).bundle()
    .on("error",function(e){
      console.error("discify: ",path,e.stack);
    }).pipe(disc())
    .pipe(fs.createWriteStream(__dirname+"/dist/file-"+name+".disc.html"))
    .on("finish",function(){
      console.log("discify: ",path);
      deps.end();
      fs.writeFileSync(__dirname+"/dist/corners-"+name+".json",JSON.stringify(corners));
    });
  });
}
