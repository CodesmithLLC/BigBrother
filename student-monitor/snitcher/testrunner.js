//TestRunner

var cp = require("child_process");
var Mocha = require('mocha');
var fs = require("fs");
var path = require("path");

var mpDir = path.normalize(__dirname+"/../node_modules/.bin/mocha-phantomjs");
var mDir =  path.normalize(__dirname+"/../node_modules/.bin/mocha");

module.exports = function(path,next){
	var mocha = new Mocha({
    reporter: 'json'
	});
	var env = {};
	for(var key in process.env) {
		env[key] = process.env[key];
	}

	fs.stat(path+"/test/index.html",function(e){
		var test;
		if(!e){
			test = cp.spawn(mpDir,["-R","json","-s","proxy=http://localhost:8001","test/index.html"],{cwd:path,env:process.env});
		}else{
			test = cp.spawn(mDir,["--reporter","json"],{cwd:path,env:process.env});
		}
		next(void(0),test);
	});
/*
	console.log(path);
	mocha.reporter(JSONReporter).grep(/test\.js$|test\/.*$/).run(function(){
		console.log(arguments);
		throw stop;
	});
/*	*/
};


function JSONReporter(runner) {
  var self = this;
  Base.call(this, runner);

  var tests = [],
     	pending = [],
     	failures = [],
     	passes = [];

  runner.on('test end', function(test){
    tests.push(test);
  });

  runner.on('pass', function(test){
    passes.push(test);
  });

  runner.on('fail', function(test){
    failures.push(test);
  });

  runner.on('pending', function(test){
    pending.push(test);
  });

  runner.on('end', function(){
    var obj = {
      stats: self.stats,
      tests: tests.map(clean),
      pending: pending.map(clean),
      failures: failures.map(clean),
      passes: passes.map(clean)
    };

    runner.testResults = obj;

    process.stdout.write(JSON.stringify(obj, null, 2));
  });
}

function clean(test) {
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration,
    err: errorJSON(test.err || {})
  };
}

/**
 * Transform `error` into a JSON object.
 * @param {Error} err
 * @return {Object}
 */

function errorJSON(err) {
  var res = {};
  Object.getOwnPropertyNames(err).forEach(function(key) {
    res[key] = err[key];
  }, err);
  return res;
}
