var pu = require("path");

var isDir = module.exports.isDir = /\/$/;

module.exports.set = function(filesystem,path,item){
  var limit = isDir.test(path)?2:1;
  path = pu.normalize(path).split(pu.sep);
  var curp;
  while(path.length > limit){
    curp = path.shift();
    if(!(curp in filesystem)) filesystem[curp] = {};
    filesystem = filesystem[curp];
  }
  filesystem[path[0]] = item;
  return filesystem;
};


module.exports.get = function(filesystem,path){
  path = pu.normalize(path).split(pu.sep);
  if(path[path.length-1]==="") path.pop();
  var curp;
  while(path.length){
    curp = path.shift();
    if(!(curp in filesystem)) throw new Error("cannot find");
    filesystem = filesystem[curp];
  }
  return filesystem;
};
