var express = require("express");
var cp = require("child_process");

var diff, firstln;
cp.exec("git diff HEAD HEAD^",{
  env:process.env,
  uid:process.getuid(),
  gid:process.getgid()
},function(err,stdout){
  if(err) throw err;
  diff = stdout.toString("utf8");
  firstln = diff.split("\n")[0];
});

var app = express();

app.use(function(req,res,next){
  console.log(req.headers);
  next();
});

["generic","formidable","busboy","multiparty"].forEach(function(type){
  app.post("/"+type,function(req,res,next){
    console.log("hitting ",type);
    next();
  },require("./parter."+type).bind(void(0),isValid));

  app.get("/"+type,function(req,res,next){
    // show a file upload form
    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<form action="/'+type+'" enctype="multipart/form-data" method="post">');
    for(var i=1;i<5;i++){
      res.write('<input type="hidden" name="key'+i+'" value="value'+i+'" /><br/>');
    }
    res.write('<input type="file" name="diff" ><br/>');
    res.write('<button type="submit">Upload</button>');
    res.end('</form>');
  });

});

app.use(function(err,req,res,next){

  if(err) console.error("Server Error:",req.path,err);
});


app.listen(8000,function(){
  var buff = "";
  process.stdin.pipe(require("split")()).on("data",function(line){
    switch(line){
      case "request": return runReqClient();
      case "superagent": return runSAClient();
      case "request-bad": return runReqClient(true);
      case "superagent-bad": return runSAClient(true);
    }
  });
});

function isValid(part,partname,filename){
  var ready = false;
  var buff = "";
  part.on("data",function(data){
    data = data.toString("utf8");
    if(data.indexOf(firstln) > -1){
      ready = true;
    }
    if(ready){
      buff += data;
    }
  });
  part.on("end",function(){
    var i = buff.indexOf(diff);
    if(i > -1){
      if(buff === diff){
        console.log(partname,"[",filename,"]", ": perfect diff");
      }else{
        var c = 0;
        while(i > -1){
          buff = buff.substring(i+diff.length);
          c++;
          i = buff.indexOf(diff);
        }
        console.log(partname,"[",filename,"]", ": has "+c+" diff(s)");
      }
    }else console.error(partname,"[",filename,"]", ": bad diff");
  });
  return true;
}

function runReqClient(bad){
  cp.fork("./client-req"+(bad?"-bad":"")+".js",{
    env:process.env,
    uid:process.getuid(),
    gid:process.getgid()
  });
}

function runSAClient(bad){
  cp.fork("./client-sa"+(bad?"-bad":"")+".js",{
    env:process.env,
    uid:process.getuid(),
    gid:process.getgid()
  });
}

process.on("uncaughtException",function(e){
  console.error("GLOBAL: ",e.stack);
});
