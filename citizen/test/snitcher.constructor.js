var fs = require("fs");
var cp = require("child_process");
var Snitcher = require("../snitcher");
var async = require("async");
var parseDiff = require("diff-parse");
var rimraf = require("rimraf");
var assert = require("assert");

var dir = __dirname+"/temp";
var count = 0;
var queue = [];

var f;
var events = [
  {type:"fs-add",list:"fsdiff",trigger:function(){
    f = Math.floor(Math.random()*100000).toString(16);
    fs.close(fs.openSync(dir+"/"+f+".txt", 'w'),function(){});
  }},{type:"fs-save",list:"fsdiff",trigger:function(){
    fs.writeFile(dir+"/"+f+".txt", "one.txt",function(){
      fs.writeFile(dir+"/"+f+"-2.txt", "two.txt",function(){});
    });
  }},{type:"fs-rem",list:"fsdiff",trigger:function(){
    fs.unlink(dir+"/"+f+".txt",function(){});
  }},{type:"commit",list:"commit",trigger:function(){
    cp.exec("git add --all",{cwd:dir},function(err){
      if(err) throw err;
      cp.exec("git commit -m \"committing "+f+"\"",{cwd:dir},function(){});
    });
  }},
];

var snitcher,central_command,citizen_listener;
describe('Snitcher', function() {
  before(function(done){
    try{
      fs.statSync(dir);
      rimraf(dir, function(e){
        if(e) throw e;
        fs.mkdir(dir,done);
      });
    }catch(e){
      fs.mkdirSync(dir);
    }
    done();
  });
  after(function(done) {
    snitcher.close();
    rimraf(dir, function(e){
      if(e) throw e;
      done();
    });
  });
  describe('#constructor', function(){
    it('should throw an error when not inside a git repository',function(done){
      try{
        snitcher = Snitcher(dir);
      }catch(e){
        return done();
      }
      done(new Error("did not throw an error"));
    });
    it('should not throw an error when inside a git repository',function(done){
      cp.execSync("git init",{cwd:dir});
      cp.execSync("git remote add origin http://happytown.com",{cwd:dir});
      try{
        snitcher = Snitcher(dir);
        return done();
      }catch(e){
        done(e);
      }
    });
    var t;
    events.forEach(function(item){
      it('should not emit '+item.type+' event before starting',function(done){
        snitcher.on(item.list,function(){
          clearTimeout(t);
          done(new Error("recieved an "+item.type));
        });
        t = setTimeout(function(){
          snitcher.removeAllListeners(item.list);
          done();
        },500);
        item.trigger();
      });
    });
    it("should start without issue since the constructor was ok",function(done){
      snitcher.start(done);
    });
    events.forEach(function(item){
      it('should emit '+item.type+' event after starting',function(done){
        this.timeout(500);
        snitcher.on(item.list,function(){
          done();
        });
        item.trigger();
      });
    });
  });
});
