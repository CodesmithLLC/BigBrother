var sa = require("superagent");
var cp = require("child_process");
var async = require("async");
var PT = require("stream").PassThrough;

async.filter(["generic","busboy","formidable","multiparty"],function(name,next){
  async.map([4,5,6],function(item,next){
    var diff = cp.spawn("git",["diff", "HEAD", "HEAD^"],{
      env:process.env,
      uid:process.getuid(),
      gid:process.getgid()
    });
    diff.on("error",function(e){
      console.error(e,item);
      next(false);
    });
    diff.stdout.on("finish",function(){
      console.log("finished pushing ", item);
    });
    var ret = diff.stdout.pipe(new PT());
    ret.pause();
    setImmediate(function(){
      next(void 0, {item:item,stream:ret});
    });
  },function(e,diffs){
    var req = sa.post("http://localhost:8000/"+name)
      .set('Transfer-Encoding', 'chunked')
      .field("key1","value1")
      .field("key2","value2")
      .field("key3","value3")
      .field("key4","value4");
    [1,2,3].forEach(function(item){
      var diff = cp.spawn("git",["diff", "HEAD", "HEAD^"],{
        env:process.env,
        uid:process.getuid(),
        gid:process.getgid()
      });
      diff.on("error",function(e){
        console.error(e,item);
        next(false);
      });
      diff.stdout.on("finish",function(){
        console.log("finished pushing ", item);
      });
      req.attach("diff",diff.stdout,"diff"+item+".txt");
    });
    diffs.forEach(function(diff){
      req.attach("diff",diff.stream,"diff"+diff.item+".txt");
    });

    req.timeout(20*1000);
    req.end(function(e,res){
        if(e){
          console.error(e);
          return next(false);
        }
        next(true);
      });
  });


},function(res){
  console.log("success: ",res);
});


function toStr(data){
  console.log(data.toString("utf8"));
}
