#!/usr/bin/env node

var async = require("async");
var MASTER_SERVER = require("./master-server");
var authorized = false;
/*
  npm install -g codesmith
  codesmith bigbrother

	https://www.npmjs.com/package/background-service-runner

*/

//globals here are fine
var STUDENT_PORTAL_LISTENER, snitcher;

async.parallel([
	createStudentPortalListener,
//	listenToStartASnitcher
	startOurSnitcher,
],function(err){
	if(err) throw err;
});

function createStudentPortalListener(next){
	var express = require("express");
	STUDENT_PORTAL_LISTENER = express();
	STUDENT_PORTAL_LISTENER.post("/authorize",function(req,res){
		MASTER_SERVER.authorize("authorize",req.body.token);
	});

	STUDENT_PORTAL_LISTENER.use(express.static("./test_tools"));
	STUDENT_PORTAL_LISTENER.get("/send-help-request",require("./help-request/route"));

	STUDENT_PORTAL_LISTENER.listen(8001);
}

function startOurSnitcher(next){
	snitcher = new (require("./snitcher"))(process.cwd());
	snitcher.on("commit",function(commit){
		MASTER_SERVER.sendCommit(commit);
	});
	snitcher.on("fsdiff",function(diff){
		MASTER_SERVER.sendFSDiff(diff);
	});
	snitcher.start(next);
}
