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
var CentralCommand, CitizenListener, snitcher;

async.parallel([
	connectToCentralCommand,
	createCitizenListener,
	listenToStartASnitcher
//	startOurSnitcher,
],function(err){
	if(err) throw err;
});


function connectToCentralCommand(next){
	var EE = require("events").EventEmitter;
 CentralCommand = new EE();
//	CentralCommand = require('socket.io-client')(big_brother_url);

	var cl,el;
	CentralCommand.once('connect', cl = function(){
		CentralCommand.removeListener('error',el);
		next();
	});
	CentralCommand.once('error', el = function(e){
		CentralCommand.removeListener('error',cl);
		next(e);
	});
}

function createCitizenListener(next){
	var express = require("express");
	CitizenListener = express();
	CitizenListener.post("/authorize",function(req,res){
		CentralCommand.emit("authorize",req.body.token);
		authorized = true;
	});

	CitizenListener.use(express.static("./test_tools"));

	CentralCommand.on("authorize-error",function(e){
		console.error(e);
		authorized = false;
	});

	CitizenListener.listen(8001);
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
			CentralCommand.send("commit",commit);
		});
		snitcher.on("fsdiff",function(diff){
			CentralCommand.emit("fsdiff",diff);
		});
		snitcher.start();
	});
	next();
}

function startOurSnitcher(next){
	snitcher = new (require("./snitcher"))(process.cwd());
	snitcher.on("commit",function(commit){
		CentralCommand.send("commit",commit);
	});
	snitcher.on("fsdiff",function(diff){
		CentralCommand.emit("fsdiff",diff);
	});
	snitcher.start(next);
}
