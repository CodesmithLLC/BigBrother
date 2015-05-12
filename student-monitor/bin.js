#!/usr/bin/env node

var fs = require('fs'),
		spawn = require('child_process').spawn,
		d = Date.now(),
		out = fs.openSync(__dirname+'/debug/'+d+'.out.log', 'a'),
		err = fs.openSync(__dirname+'/debug/'+d+'.err.log', 'a');

var child = spawn('node', [__dirname+'/server'], {
	detached: true,
	stdio: [ 'ignore', out, err ],
	env:process.env,
	gid:process.getgid(),
	uid:process.getuid(),
});

child.unref();
