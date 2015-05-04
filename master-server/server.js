var express = require("express"),
  app = express(),
  SIO = require("socket.io"),
  server = require("http").Server(app),
  io = SIO(server),
  user = void(0);
//	REE = require('redis-eventemitter');

var async = require("async");
/*

Ice com database <-> Ice chat database

*/

async.applyEachSeries(
  [
    //Ensure we have a connection to our database
    connectDatabase,
		//Ensure we create our cluster event Emitter
    connectToClusterEE,
    //Ensure we can support user sessions
    setupUser,
    //give routes
    registerRoutes,
    //Ensure our server is up and running
    setupServer
  ],
  require("./config"),
  function(err){
    if(err) throw err;
    console.log("Server Ready");
  }
);

function connectDatabase(config,next){
  var mongoose = require("mongoose");
  if(config.db.debug){
    mongoose.set("debug", true);
  }
  mongoose.connect(config.db.url, config.db.options);
  var erlist,oplist;
  erlist = function(err){
    mongoose.connection.removeListener("open",oplist);
    console.error("Database Error");
    next(err);
  };
  oplist = function(err){
    mongoose.connection.removeListener("error",erlist);
    console.log("Database used "+config.db.url);
    var Grid = require('gridfs-stream');
    mongoose.gfs = Grid(mongoose.connnection.db, mongoose.mongo);
    next();
  };
  mongoose.connection.once( "error", erlist);
  mongoose.connection.once( "open", oplist);
  //This is replacing the cluster EventEmitter for now
  mongoose.ee = new require("events").EventEmitter();
}


function connectToClusterEE(config,next){
  next();
/*
  we're going to want to bind this to either redis or through node.
  for now it doesn't matter
  redis({
	    port: 6379,
	    host: '127.0.0.1',
	    prefix: 'production:',
	    auth_pass: 'mypassword'
	    // in case you want to control Redis clients
	    // creation you can specify pub/sub clients pair:
	    // pub: pubClient,
	    // sub: subClient
	});
  */
}

function setupUser(config,next){
  require("./User")(config,function(err,u){
    if(err) return next(err);
    user = u;
    next();
  });
}

function registerRoutes(config,next){
  // ties apikey with user
  app.use(user.middleware.http);
  app.use(user.router);

  app.get("/",function(req,res,next){
    if(!req.user) return res.redirect("/login");
    if(req.user.roles.indexOf("teachers_assistant") !== -1) return res.redirect("/ta-portal");
    if(req.user.roles.indexOf("student") !== -1) return res.redirect("/student-portal");
    next();
  });

  io.use(user.middleware.io);
  io.of("/bigbrother").on("connect",require("./student-monitor/ws.js"));
//  io.of("/help-analysis").on("connect",require("./help-request/ws.js"));

  app.use(require("./Abstract/mongooseRouter"));
  next();
}

function setupServer(config,next){
  server.listen(config.http.port,config.http.ip,function(){
    console.log("HTTP listening on http://localhost:"+config.http.port);
    next();
  });
}
