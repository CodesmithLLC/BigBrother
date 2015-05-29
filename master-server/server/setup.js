module.exports.createServer = function createServer(obj,config,next){
  obj.server = require("http").Server();
  next();
};

module.exports.createRouter = function createRouter(obj,config,next){
  var express = require("express"),
    app = express();
  obj.http = app;
  obj.server.on("request",app);
  next();
};

module.exports.createUpgrade = function createUpgrade(obj,config,next){
  var SIO = require("socket.io"),
  io = SIO(obj.server);
  obj.ws = io;
  next();
};

module.exports.connectDatabase = function connectDatabase(obj,config,next){
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
};

module.exports.setupUser = function setupUser(obj,config,next){
  require("../User")(config,function(err,u){
    if(err) return next(err);
    obj.user = u;
    // ties apikey with user
    if(obj.http){
      obj.http.use(function(req,res,next){
        console.log("in");
        next();
      })
      .use(u.middleware.http)
      .use(u.router);
    }
    if(obj.ws){
      u.middleware.ws.forEach(obj.ws.use.bind(obj.ws));
    }
    next();
  });
};

module.exports.setupCluster = function setupCluster(obj,config,next){
  var cluster = require("cluster");
  if(!cluster.isMaster){
    var globalEE = require("./cluster/global-ee");
    obj.ws.adapter(require("Abstract/socket.io-cluster-adapter")(globalEE));
    var sticky = require('sticky-session');
    sticky(obj.server);
  }
  next();
};

module.exports.startServer = function startServer(obj,config,next){
  obj.server.listen(config.http.port,config.http.ip,function(){
    console.log("HTTP listening on http://localhost:"+config.http.port);
    next();
  });
}
