var path = require("path");
global.__root = path.resolve(__dirname+"/..");
/*
switch(process.env.TYPE){
  case "Development": require("./start-all"); break;
  case "master-server": require("./cluster/master-server"); break;
  case "instance-fork": require("./cluster"); break;
  case "micro": require("server-template");
}
*/
var async = require("async");
global.__root = __dirname;

var Setup = require("./setup");

async.applyEachSeries(
  [
    //Ensure we have a connection to our database
    Setup.connectDatabase,
    //Create our server
    Setup.createServer,
    //Create a router
    Setup.createRouter,
    //Allow websocket support
    Setup.createUpgrade,
    //Ensure we can support user sessions
    Setup.setupUser,
    //Handle if this is an instance of a cluster
    Setup.setupCluster,
    //give routes
    function(obj,config,next){
      obj.http.get("/",function(req,res,next){
        console.log("index",req.user);
        if(!req.user) return res.redirect("/login");
        next();
      });
      async.applyEachSeries([
        require("./micro-processes/static-content"),
        require("./micro-processes/mongoose"),
        require("./micro-processes/websocket")
      ],obj,config,function(e){
        if(e) return next(e);
        obj.http.use(function(req,res,next){
          next("Not found");
        }).use(function(err,req,res,next){
          if(err) console.error("http error: ",err,err.stack);
          next(err);
        });
        next();
      });
    },
    //create the dummy users
    //Enable Terminal commands
    require("./debug"),
    //Ensure our server is up and running
    Setup.startServer
  ], {}, require("../config"),
  function(err){
    if(err){
      console.error("have error");
      throw err;
    }
    console.log("Server Ready");
  }
);
