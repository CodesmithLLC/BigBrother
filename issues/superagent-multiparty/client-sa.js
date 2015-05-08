var sa = require("request");
var cp = require("child_process");
var async = require("async");

async.filter(["generic","busboy","formidable","multiparty"],function(name,next){
  var diff = cp.spawn("git",["diff"],{
    env:process.env,
    uid:process.getuid(),
    gid:process.getgid()
  });

  //diff.stdout.on("data",toStr);
  //diff.stderr.on("data",toStr);
  diff.on("error",function(e){
    console.error(e);
    next(false);
  });
  diff.stdout.on("finish",function(){
    console.log("finished pushing");
  });

  var req = sa
    .post("http://localhost:8000/"+name)
    .field("key1","value1")
    .field("key2","value2")
    .field("key3","value3")
    .attach("diff",diff.stdout,"diff.txt")
    .field("key4","value4")
    .end(function(e,res){
      if(e){
        console.error(e);
        return next(false);
      }
      next(true);
    });
},function(res){
  console.log("success: ",res);
});


function toStr(data){
  console.log(data.toString("utf8"));
}
