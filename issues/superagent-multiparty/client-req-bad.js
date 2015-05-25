var sa = require("request");
var cp = require("child_process");
var async = require("async");
var PT = require("stream").PassThrough;

console.log("child");

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
    setImmediate(function(){
      next(void 0, {item:item,stream:diff.stdout});
    });
  },function(e,diffs){
    var req = sa.post("http://localhost:8000/"+name,{headers: {
      'transfer-encoding': 'chunked'
    },timeout:20*1000})
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
    form.append("key4","value4");

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
      form.append("diff",diff.stdout,{filename:"diff"+item+".txt"});
    });

    diffs.forEach(function(diff){
      form.append("diff",diff.stream,{filename:"diff"+diff.item+".txt"});
    });
  });
},function(res){
  console.log("success: ",res);
});


function toStr(data){
  console.log(data.toString("utf8"));
}
