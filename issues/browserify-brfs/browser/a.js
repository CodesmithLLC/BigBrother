var fs = require("fs");
var template = fs.readFileSync(__dirname+"/a.html","utf8");
var style = fs.readFileSync(__dirname+"/a.css","utf8");
var temp = fs.readFileSync(require.resolve("c3/c3.css"),"utf8");

var utils = require("../utils");
utils.appendCSS(style);

require(__dirname+"/bin.js");



















//=============================
