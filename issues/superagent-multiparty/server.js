var express = require("express");
var cp = require("child_process");

var app = express();

app.use(function(req,res,next){
  console.log("content-type: ",req.headers["content-type"]);
  next();
});

["generic","formidable","busboy","multiparty"].forEach(function(type){
  app.post("/"+type,function(req,res,next){
    console.log("hitting ",type);
    next();
  },require("./multiparters/"+type).bind(void(0),isValid));

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
  if(err) console.error(err);
});


app.listen(8000,function(){
  runReqClient();
});

function isValid(part){
  return true;
}

function runReqClient(){
  cp.fork("./client-req.js",{
    env:process.env,
    uid:process.getuid(),
    gid:process.getgid()
  });
}

function runSAClient(){
  cp.fork("./client-sa.js",{
    env:process.env,
    uid:process.getuid(),
    gid:process.getgid()
  });
}
