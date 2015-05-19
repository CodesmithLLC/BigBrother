var express = require("express"),
  app = express(),
  SIO = require("socket.io"),
  server = require("http").Server(app),
  io = SIO(server),
  user = void(0);

var async = require("async");
global.__root = __dirname;

async.applyEachSeries(
  [
    //Ensure we have a connection to our database
    connectDatabase,
		//Ensure we create our cluster event Emitter
    connectToClusterEE,
    //Ensure we can support user sessions
    setupUser,
    //create the dummy users
    createDummyUsers,
    //give routes
    registerRoutes,
    //Ensure our server is up and running
    setupServer,
    //Enable Terminal commands
    setupStdIn
  ],
  require("./config"),
  function(err){
    if(err){
      console.error("have error");
      throw err;
    }
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
    mongoose.gfs = Grid(mongoose.connection.db, mongoose.mongo);
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

function createDummyUsers(config,next){
  require("./debug")(next);
}

function registerRoutes(config,next){
  // ties apikey with user
  app.use(function(req,res,next){
    console.log("in");
    next();
  });
  app.use(user.middleware.http);
  app.use(user.router);
  app.get("/",function(req,res,next){
    console.log("index",req.user);
    if(!req.user) return res.redirect("/login");
    next();
  });

  app.use(require("./portals/router"));

  user.middleware.ws.forEach(io.use.bind(io));
  io.of("/student-monitor").on("connect",require("./student-monitor/ws"));
  var ns = io.of("/help-request");
  ns.on("connect",require("./help-request/ws")(ns));

  app.use(require("./Abstract/mongooseRouter"));
  app.use(function(req,res,next){
    next("Not found");
  });
  app.use(function(err,req,res,next){
    if(err) console.error("http error: ",err,err.stack);
    next(err);
  });
  next();
}

function setupServer(config,next){
  server.listen(config.http.port,config.http.ip,function(){
    console.log("HTTP listening on http://localhost:"+config.http.port);
    next();
  });
}

function setupStdIn(config,next){
  var mongoose = require("mongoose");
  process.stdin.pipe(require("split")()).on("data",function(line){
    if(/^gridfs/.test(line)){
      var item;
      if(/^gridfs:\/\//.test(line)){
        item = line.substring(9);
      }else{
        item = line.split(" ")[1];
      }
      mongoose.gfs
        .createReadStream({_id: item, root:"HelpRequest"})
        .on("error",function(e){
          console.error("cannot get ",item,e);
        })
        .pipe(process.stdout);
      return;
    }
  });
  console.log("commands enabled: ","gridfs");
  next();
}
