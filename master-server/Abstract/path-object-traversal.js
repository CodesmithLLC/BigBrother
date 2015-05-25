var pu = require("path");

var isDir = module.exports.isDir = /\/$/;
var startSlash = module.exports.startSlash = /^\//;

module.exports.set = function(filesystem,path,item){
  var limit = isDir.test(path)?2:1;
  path = pu.normalize(path).split(pu.sep);
  if(path[0] === "") path.shift();
  var curp;
  while(path.length > limit){
    curp = path.shift().replace(/\./,"%2E");
    if(!(curp in filesystem)) filesystem[curp] = {};
    filesystem = filesystem[curp];
  }
  filesystem[path[0].replace(/\./,"%2E")] = item;
  return filesystem;
};


module.exports.get = function(filesystem,path){
  path = pu.normalize(path).split(pu.sep);
  if(path[path.length-1]==="") path.pop();
  if(path[0] === "") path.shift();
  console.log(path);
  if(path.length === 0 || path[0] === "."){
    return filesystem;
  }
  var curp;
  while(path.length){
    curp = path.shift().replace(/\./,"%2E");
    if(!(curp in filesystem)) throw new Error("cannot find "+path+" in "+JSON.stringify(filesystem));
    filesystem = filesystem[curp];
  }
  return filesystem;
};
