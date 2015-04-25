//TestRunner

var child_process = require("child_process");


module.exports = function(next){
	child_process.exec("npm test -- --reporter json",function(err,stdout,stderr){
		if(err) return next(err);
		next(void(0),JSON.parse(stdout.toString("utf8")));
	});
};
