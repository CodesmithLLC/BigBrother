//https://github.com/substack/node-git-emit/issues/2

var fs = require("fs");
var CentralCommand = require("./CentralCommand");
var testRunner = require("./testrunner");
var simpleGit = require("simple-git");
var chokidar = require("chokidar");

var child_process = require("child_process");
var subject = child_process.execSync("git config --get remote.origin.url").toString("utf8");
if(!subject) throw new Error("Big Brother should be run from within a git repository");


var gd = process.cwd();
gd = gd+"/.git";
if(!fs.statSync(gd).isDirectory()){
	throw new Error("Big brother should be started in a git repository");
}

var ghan = simpleGit(gd);
var gee = gitEmit(cwd+"/.git", cb);
gee.on("post-commit",function(){
	ghan.diff(function(err,diff){
		testRunner.run(function(test_res){
			CentralCommand.send("commit",{
				subject:subject,
				diff:diff,
				test:test_res
			});
		});
	});
});

var gwat = chokidar.watch('.', {ignored: /[\/\\]\./})
.on('add', function(path) {
	testRunner.run(function(test_res){
		CentralCommand.emit("fsdiff",{
			subject:subject,
			diff:"add-file",
			path:path,
			test:test_res
		});
	});
}).on('change', function(path) {
	ghan.diff("HEAD "+path,function(err,diff){
		testRunner.run(function(test_res){
			CentralCommand.emit("fsdiff",{
				subject:subject,
				diff:diff,
				path:path,
				test:test_res
			});
		});
	});
}).on('unlink', function(path) {
	testRunner.run(function(test_res){
		CentralCommand.send("fsdiff",{
			subject:subject,
			diff:"rem-file",
			path:path,
			test:test_res
		});
	});
});
