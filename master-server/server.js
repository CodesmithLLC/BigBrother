var express = require("express"),
  app = express(),
  server = require("http").Server(app),
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
  require("./server/config"),
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
    next();
  };
  mongoose.connection.once( "error", erlist);
  mongoose.connection.once( "open", oplist);
}


function connectToClusterEE(config,next){
	global.clusterEE = new EE();
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
  app.use(user.router.http);

  app.get("/",function(req,res,next){
    if(!req.user) return res.redirect("/login");
    if(req.user.roles.indexOf("teachers_assistant") !== -1) return res.redirect("/ta-portal");
    if(req.user.roles.indexOf("student") !== -1) return res.redirect("/student-portal");
    next();
  });

	var BigBrother = require("./BigBrother");
	var Data = require("./Data");
  BigBrother.use(user.middleware.io);
  Data.use(user.middleware.io);

	BigBrother.atttachMe.attach(http,{path:"/bigbrother"});
	Data.attachMe.attach(http,{path:"/data-analysis"});

  app.use(require("./Abstract/mongooseRouter"));
  next();
}

function setupServer(config,next){
  server.listen(config.http.port,config.http.ip,function(){
    console.log("HTTP listening on http://localhost:"+config.http.port);
    next();
  });
}


var server = http.createServer(app);
