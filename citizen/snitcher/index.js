//https://github.com/substack/node-git-emit/issues/2
var fs = require("fs");
var testRunner = require("./testrunner");
var simpleGit = require("simple-git");
var chokidar = require("chokidar");
var child_process = require("child_process");
var pathutil = require("path");
var gitEmit = require("git-emit");
var EE = require("events").EventEmitter;


function Snitcher(path){
	if(!(this instanceof Snitcher)) return new Snitcher(path);
	EE.call(this);
	var subject = child_process.execSync(
		"git config --get remote.origin.url",{cwd:path}
	).toString("utf8");
	if(!subject) throw new Error("Big Brother should be run from within a git repository");
	this.subject = subject;
	this.path = pathutil.resolve(path);
	this.gdir = pathutil.resolve(path+"/.git");
	if(!fs.statSync(this.gdir).isDirectory()){
		throw new Error("Big brother should be started in a git repository");
	}
}

Snitcher.prototype = Object.create(EE.prototype);
Snitcher.prototype.constructor = Snitcher;

Snitcher.prototype.start = function(next){
	console.log("started");
	var self = this;
	this.git_handle = simpleGit(this.path);
	this.git_ee = gitEmit(this.gdir,console.error.bind(console));
	this.fs_watch = chokidar.watch(this.path, {ignored: /[\/\\]*\.\w$|[\/\\]node_modules/});

	this.git_ee.on("post-commit",function(){
		console.log(arguments);
		self.git_handle.diff(function(err,diff){
			testRunner(self.path,function(test_res){
				self.emit("commit",{
					subject:self.subject,
					diff:diff,
					test:test_res
				});
			});
		});
	});

	this.fs_watch.on('add', function(path) {
		testRunner(self.path,function(test_res){
			self.emit("fsdiff",{
				subject:self.subject,
				diff:"fs-add",
				path:path,
				test:test_res
			});
		});
	}).on('change', function(path) {
		self.git_handle.diff("HEAD "+path,function(err,diff){
			testRunner(self.path,function(test_res){
				self.emit("fsdiff",{
					subject:self.subject,
					diff:diff,
					path:path,
					test:test_res
				});
			});
		});
	}).on('unlink', function(path) {
		testRunner(self.path,function(test_res){
			self.emit("fsdiff",{
				subject:self.subject,
				diff:"fs-rem",
				path:path,
				test:test_res
			});
		});
	});
	setImmediate(next);
};

Snitcher.prototype.close = function(){
	this.git_ee.close();
	this.fs_watch.close();
};

module.exports = Snitcher;
