//TestRunner

var child_process = require("child_process");


module.exports = function(path,next){
	child_process.exec("mocha --reporter json",{cwd:path},function(err,stdout,stderr){
		if(err) return next(err);
		console.error(stderr);
		next(void(0),JSON.parse(stdout.toString("utf8")));
	});
};
