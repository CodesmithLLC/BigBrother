var express = require("express"),
  app = express(),
  server = require("http").Server(app),
  SIO = require('socket.io'),
	REE = require('redis-eventemitter');

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
    bindUserSessions,
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
	global.clusterEE = redis({
	    port: 6379,
	    host: '127.0.0.1',
	    prefix: 'production:',
	    auth_pass: 'mypassword'
	    // in case you want to control Redis clients
	    // creation you can specify pub/sub clients pair:
	    // pub: pubClient,
	    // sub: subClient
	});
}

function bindUserSessions(config,next){
  var user = require("./server/user")(config);
  app.use(user.middleware.http);
  app.use(user.router.http);
  io.use(user.middleware.ws);
  next();
}

function registerRoutes(config,next){
  // ties apikey with user

  app.use(express.static(__dirname +'/build'));

  app.post('/apiKey', function(req, res) {
      req.user.apiKey = req.body.apiKey;
      res.status(200).send(req.user);
  });

  app.get('/apiKey', function(req, res) {
      res.status(200).send(req.user.apiKey);
  });

  app.use("/",require("./stand-alone/router"));
  io.on('connection', function(socket){
    console.log(socket);
  });

	var BigBrother = require("./BigBrother");
	var Data = require("./Data");

	BigBrother.atttachMe.attach(http,{path:"/bigbrother"});
	Data.attachMe.attach(http,{path:"/data-analysis"});

  next();
}

function setupServer(config,next){
  server.listen(config.http.port,config.http.ip,function(){
    console.log("HTTP listening on http://localhost:"+config.http.port);
    next();
  });
}


var server = http.createServer(app);
