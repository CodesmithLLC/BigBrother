// #! node
/*
  npm install -g codesmith
  codesmith bigbrother

	https://www.npmjs.com/package/background-service-runner

*/
//Central Command

var async = require("async");

//globals here are fine
var CentralCommand, CitizenListener, snitcher;

asyn.parrallel([
	connectToCentralCommand,
	createCitizenListener,
	startOurSnitcher,
],function(err){
	if(err) throw err;
});


function connectToCentralCommand(next){
	CentralCommand = require('socket.io-client')(big_brother_url);

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
	CitizenListener = require('socket.io')();
	var t;
	CitizenListener.on("connect",function(ws){
		if(t){
			clearTimeout(t);
			next();
		}
		ws.on("authorize",CentralCommand.emit.bind(CentralCommand,"authorize"));
	});

	CentralCommand.on("authorize-error",function(e){
		console.error(e);
	});

	CitizenListener.listen(8001);
	setTimeout(function(){
		next(new Error("The Citizen should have connected within 5 seconds"));
	},5*1000);
}

function startOurSnitcher(next){
	snitcher = new (require("./snitcher"))(process.cwd());
	snitcher.on("commit",function(commit){
		CentralCommand.send("commit",{
			subject:subject,
			diff:diff,
			test:test_res
		});
	});
	snitcher.on("commit",function(commit){
		CentralCommand.send("commit",commit);
	});
	snitcher.on("fsdiff",function(diff){
		CentralCommand.emit("fsdiff",diff);
	});
	snitcher.start(next);
}


module.exports = client;
