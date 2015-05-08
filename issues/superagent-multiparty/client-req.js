var sa = require("request");
var cp = require("child_process");
var async = require("async");

console.log("child");

async.filter(["generic","busboy","formidable","multiparty"],function(name,next){
  var diff = cp.spawn("git",["diff"],{
    env:process.env,
    uid:process.getuid(),
    gid:process.getgid()
  });

  //diff.stdout.on("data",toStr);
  //diff.stderr.on("data",toStr);
  diff.on("error",function(e){
    throw e;
  });
  diff.stdout.on("finish",function(){
    console.log("finished pushing");
  });

  var req = sa.post("http://localhost:8000/"+name,{formData:{
    key1:"value1",
    key2:"value2",
    key3:"value3",
    diff:{
      value:  diff.stdout,
      options: {
        filename:"diff.txt",
        contentType: 'text/plain'
      }
    },
    key4:"value4"
  }})
  .on("error",function(e){
    console.error(e);
    next(false);
  })
  .on("response",function(){
    next(true);
  });
},function(res){
  console.log("success: ",res);
});


function toStr(data){
  console.log(data.toString("utf8"));
}
