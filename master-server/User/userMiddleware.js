var passport = require("./passport.config.js"),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
expressSession = require('express-session'),
passportSocketIo = require("passport.socketio"),
UserModel = require("./UserModel");

module.exports = function(config){
  var store = new expressSession.MemoryStore();
  var session =  expressSession({
      store: store,
      secret: config.session_secret,
      resave: false,
      saveUninitialized: false
  });

  return {http:[
    cookieParser(),
    session,
    passport.initialize(),
    passport.session(),
    function(req,res,next){
      if(req.user) return next();
      if(!req.headers.authorization) return next();
      console.log("basic");
      passport.authenticate('basic', { session: false })(req,res,next);
    },
  ],ws:[
    passportSocketIo.authorize({
        secret: config.session_secret,
        resave: false,
        saveUninitialized: false,
        store: store,
        cookieParser: cookieParser
    }),
    function(socket,next){
      console.log("end middleware");
      if(socket.request.user){
        console.log("have user: ",socket.request.user);
        return next();
      }
      console.log(socket.request);
      var token = socket.request.query.token;
      if(!token) return next();
      UserModel.userFromToken(token,function(e,user){
        if(e) return next(e);
        socket.request.user = user;
        next();
      });
    }
  ]};
};
