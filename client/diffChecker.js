//https://github.com/substack/node-git-emit/issues/2

var fs = require("fs");
var CentralCommand = require("./CentralCommand");
var TestRunner = require("./TestRunner");
var simpleGit = require("simple-git");
var chokidar = require("chokidar");

var gd = process.cwd();
gd = gd+"/.git";
if(!fs.statSync(gd).isDirectory()) throw new Error("Big brother should be started in a git repository");

var ghan = simpleGit(gd);
var gee = gitEmit(cwd+"/.git", cb);
gee.on("post-commit",function(){
	ghan.diff(function(err,diff){
		TestRunner.run(function(test_res){
			CentralCommand.send("commit-add",{
				diff:diff,
				test:test_res
			});
		});
	});
});

var gwat = chokidar.watch('.', {ignored: /[\/\\]\./})
  .on('add', function(path) { 
		CentralCommand.send("fs-add",{
			path:path
		});
	})
  .on('change', function(path) {
		ghan.diff("HEAD "+path,function(err,diff){
			TestRunner.run(function(test_res){
				CentralCommand.send("fs-diff",{
					path:path,
					diff:diff,
					test:test_res
				});
			});
		});
	})
  .on('unlink', function(path) {
		CentralCommand.send("fs-rem",{
			path:path
		});
	})

