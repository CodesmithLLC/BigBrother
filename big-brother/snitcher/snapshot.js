var fs = require("fs");
var minimatch = require("minimatch");
var tar = require("tar-fs");

var isWhiteSpace = /^\s*$/;

module.exports = function(path,next){
  var globMatches = [];
  fs.readFile(path+"/.gitignore",{encoding:"utf8"},function(err,ignores){
    ignores.split("\n").forEach(function(ignore){
      if(isWhiteSpace.test(ignore)) return;
      globMatches.push(minimatch.filter(ignore, {matchBase: true}));
    });
  });
  return tar.pack(path,{
    ignore:function(name){
      globMatches.some(function(fn){
        return fn(name);
      });
    }
  });
};
