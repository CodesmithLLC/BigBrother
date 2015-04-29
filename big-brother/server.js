// #! node
/*
  npm install -g codesmith
  codesmith bigbrother

	https://www.npmjs.com/package/background-service-runner

*/
//Central Command

var async = require("async");
var authorized = false;

//globals here are fine
var MASTER_SERVER, STUDENT_PORTAL_LISTENER, snitcher;

async.parallel([
	connectToMASTER_SERVER,
	createSTUDENT_PORTAL_LISTENER,
	listenToStartASnitcher
//	startOurSnitcher,
],function(err){
	if(err) throw err;
});


function connectToMASTER_SERVER(next){
	var EE = require("events").EventEmitter;
	MASTER_SERVER = new EE();
//	MASTER_SERVER = require('socket.io-client')(big_brother_url);

	var cl,el;
	MASTER_SERVER.once('connect', cl = function(){
		MASTER_SERVER.removeListener('error',el);
		next();
	});
	MASTER_SERVER.once('error', el = function(e){
		MASTER_SERVER.removeListener('error',cl);
		next(e);
	});
}

function createSTUDENT_PORTAL_LISTENER(next){
	var express = require("express");
	STUDENT_PORTAL_LISTENER = express();
	STUDENT_PORTAL_LISTENER.post("/authorize",function(req,res){
		MASTER_SERVER.emit("authorize",req.body.token);
		authorized = true;
	});

	STUDENT_PORTAL_LISTENER.use(express.static("./test_tools"));
	STUDENT_PORTAL_LISTENER.get("/send-help-request",require("help-request"));

	MASTER_SERVER.on("authorize-error",function(e){
		console.error(e);
		authorized = false;
	});

	STUDENT_PORTAL_LISTENER.listen(8001);
}

function listenToStartASnitcher(next){
	var buffer = "";
	process.stdin.on("data",function(data){
		data = data.toString("utf8");
		if(data.length > 10000){
			console.error("far too large");
			return;
		}
		if(data.indexOf("\n") == -1) return buffer += data;
		if(snitcher) snitcher.close();
		if(!authorized) return console.error("You need to be authorized");
		var dir = data.split("\n");
		data = buffer + dir[0];
		buffer = dir[1];
		snitcher = new (require("./snitcher"))(dir);
		snitcher.on("commit",function(commit){
			MASTER_SERVER.send("commit",commit);
		});
		snitcher.on("fsdiff",function(diff){
			MASTER_SERVER.emit("fsdiff",diff);
		});
		snitcher.start();
	});
	next();
}

function startOurSnitcher(next){
	snitcher = new (require("./snitcher"))(process.cwd());
	snitcher.on("commit",function(commit){
		MASTER_SERVER.send("commit",commit);
	});
	snitcher.on("fsdiff",function(diff){
		MASTER_SERVER.emit("fsdiff",diff);
	});
	snitcher.start(next);
}
