var sa = require("request");
var cp = require("child_process");
var async = require("async");

console.log("child");

async.filter(["generic","busboy","formidable","multiparty"],function(name,next){
  var diff = cp.spawn("git",["diff","HEAD","HEAD^"],{
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

  var req = sa.post("http://localhost:8000/"+name)
  .on("error",function(e){
    console.error(e);
    next(false);
  })
  .on("response",function(){
    next(true);
  });

  var form = req.form();
  form.append("key1","value1");
  form.append("key2","value2");
  form.append("key3","value3");
  form.append("diff",diff.stdout,{filename:"diff.txt"});
  form.append("key4","value4");
},function(res){
  console.log("success: ",res);
});


function toStr(data){
  console.log(data.toString("utf8"));
}
