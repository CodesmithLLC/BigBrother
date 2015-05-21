var sa = require("superagent");
var cp = require("child_process");
var async = require("async");

async.filter(["generic","busboy","formidable","multiparty"],function(name,next){
  var diff = cp.spawn("git",["diff", "HEAD", "HEAD^"],{
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

  var req = sa.post("http://localhost:8000/"+name)
    .set('Transfer-Encoding', 'chunked')
    .field("key1","value1")
    .field("key2","value2")
    .field("key3","value3")
    .attach("diff",diff.stdout,"diff.txt")
    .field("key4","value4");

  [1,2,3,4,5].forEach(function(item){
    var diff = cp.spawn("git",["diff", "HEAD", "HEAD^"],{
      env:process.env,
      uid:process.getuid(),
      gid:process.getgid()
    });

    //diff.stdout.on("data",toStr);
    //diff.stderr.on("data",toStr);
    diff.on("error",function(e){
      console.error(e,item);
      next(false);
    });
    diff.stdout.on("finish",function(){
      console.log("finished pushing ", item);
    });
    req.attach("diff",diff.stdout,"diff"+item+".txt");
  });

  req.end(function(e,res){
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
