var fs = require("fs");
var cp = require("child_process");
var Snitcher = require("../snitcher");
var async = require("async");
var parseDiff = require("diff-parse");
var rimraf = require("rimraf");
var assert = require("assert");

var dir = __dirname+"/temp2";


var snitcher,central_command,citizen_listener;
describe('Snitcher', function() {
  before(function(done) {
    function fin(){
      cp.execSync("git init",{cwd:dir});
      cp.execSync("git remote add origin http://happytown.com",{cwd:dir});
      fs.createReadStream(__dirname+'/../mock_test.js')
      .pipe(fs.createWriteStream(dir+'/test.js'))
      .on("finish",function(){
        snitcher = Snitcher(dir);
        done();
      });
    }
    try{
      fs.statSync(dir);
      rimraf(dir, fin);
    }catch(e){
      fs.mkdir(dir,fin);
    }
  });
  after(function(done){
    rimraf(dir,done);
  });
  describe('#events',function(){
    var diff;
    function checkFailData(inputpath,diffHandler,pf){
      ["subject","path","test","diff"].forEach(function(key){
        it("should have a "+key,function(){
          assert(typeof diff[key] !== "undefined");
        });
      });
      it("path should be correct",function(){
        assert(diff.path === inputpath);
      });
      it("diff should be ok",function(){
        assert(diffHandler(diff.diff));
      });
      it("test should be "+(pf?"passing":"failing"),function(){
        if(pf){
          assert(diff.test.stats.failures === 0);
        }else{
          assert(diff.test.stats.failures > 0);
        }
      });
    }
    it("should start emit an event when a file is created",function(done){
      this.timeout(500);
      snitcher.once("fsdiff",function(d){
        diff = d;
        checkFailData(dir+"/one.txt",function(d){return d === "fs-add";},false);
        done();
      });
      fs.writeFileSync(dir+"/one.txt","one.txt");
    });
    it("should have a passing test",function(){
      this.timeout(500);
      snitcher.once("fsdiff",function(diff){
        if(diff.test.stats.failures > 0)
          throw new Error("test had failures");
        done();
        next();
      });
      fs.writeFileSync(dir+"/two.txt","two.txt");
    });
    it("should start emit an event when a file is modified",function(done){
      this.timeout(500);
      snitcher.once("fsdiff",function(d){
        diff = d;
        checkFailData(dir+"/one.txt",parseDiff,false);
        done();
      });
      fs.writeFileSync(dir+"/one.txt","one");
    });
    it("should have a passing test",function(){
      this.timeout(500);
      snitcher.once("fsdiff",function(diff){
        if(diff.test.stats.failures > 0)
          throw new Error("test had failures");
        done();
        next();
      });
      fs.writeFileSync(dir+"/one.txt","one.txt");
    });
    it("should emit an event when a file is deleted",function(done){
      fs.closeSync(fs.openSync(dir+"/three.txt", 'w'));
      this.timeout(500);
      snitcher.once("fsdiff",function(d){
        diff = d;
        checkFailData(dir+"/three.txt",function(d){return d === "fs-rem";},true);
        done();
      });
      fs.unlinkSync(dir+"/three.txt");
    });
    it("should have a failing test",function(){
      this.timeout(500);
      snitcher.once("fsdiff",function(diff){
        if(diff.test.stats.failures === 0)
          throw new Error("test had failures");
        done();
      });
      fs.unlinkSync(dir+"/one.txt");
    });
    it("should emit an event when a commit is made deleted",function(done){
      this.timeout(500);
      snitcher.once("commit",function(d){
        diff = d;
        checkFailData(void(0),parseDiff,false);
        done();
      });
      cp.execSync("git add --all",{cwd:dir});
      cp.execSync("git commit -m \"committing 2\"",{cwd:dir});
    });
    it("should have a passing test",function(){
      fs.writeFileSync(dir+"/one.txt","one.txt");
      this.timeout(500);
      snitcher.once("commit",function(diff){
        if(diff.test.stats.failures > 0)
          throw new Error("test had failures");
        done();
      });
      fs.unlinkSync(dir+"/one.txt");
    });
  });
});
