var fs = require("fs");
var minimatch = require("minimatch");
var tar = require("tar-fs");

var isWhiteSpace = /^\s*$/;

module.exports = function(path,next){
  fs.readFile(path+"/.gitignore",{encoding:"utf8"},function(err,ignores){
    var globMatches = [];
    ignores.split("\n").forEach(function(ignore){
      if(isWhiteSpace.test(ignore)) return;
      globMatches.push(minimatch.filter(ignore, {matchBase: true}));
    });
    return tar.pack(path,{
      ignore:function(name){
        return globMatches.some(function(fn){
          return fn(name);
        });
      }
    });
  });
};
