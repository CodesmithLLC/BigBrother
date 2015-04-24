//TestRunner

var child_process = require("child_process");


module.exports = function(next){
	child_process.exec("npm test",function(err,stdout,stderr){
		next(err,{stdout:stdout,stderr:stderr});
	});
});
