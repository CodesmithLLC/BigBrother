var jQuery = require("jquery");
var path = "/";
var pot = require("../path-object-traversal");
var sa = require("superagent");
var hljs = require("highlight.js");
var fs = require("fs");
var path = require('path');
require("../browserify-utils").appendCSS(fs.readFileSync(
  path.resolve(require.resolve("highlight.js")+"/../../styles/default.css")
));
var template = fs.readFileSync(__dirname+"/template.html","utf8");
var Mustache = require("mustache");
Mustache.parse(template);


function FileBrowser(snapshot) {
  this.elem = jQuery(template);
  this.dirElem = this.elem.find(".files");
  this.fileElem = this.elem.find(".file_view");
  this.cd = this.elem.find(".current_path");
  this.href = "";
  var self = this;
  jQuery(this.elem).on("click", ".current_path a,.files .directory a", function (e) {
    e.preventDefault();
    self.changeDirectory(jQuery(this).attr("href"));
  });
  // open file when clicked
  jQuery(this.elem).on("click", ".files .file a", function (e) {
    e.preventDefault();
    self.viewFile(jQuery(this).attr("href"));
  });
  if(snapshot) return this.loadSnapshot(snapshot);
  /* This will likely be used later, though obviously not in these words
    this.listener = methods.listen("/list/path", function (err, list) {
      if (err) return alert(JSON.stringify(err));
      self.processList(self.href, list);
    });
   */
}

FileBrowser.prototype.loadSnapshot = function(snapshot){
  this.snapshot = snapshot;
  this.changeDirectory("/");
};

FileBrowser.prototype.processCD = function (href) {
  var aref = href.split("/");
  if (pot.isDir.test(href)) {
    aref.pop();
  }
  this.cd.empty();
  var netref = "";
  for (var i = 0; i < aref.length; i++) {
    var name = aref[i];
    if (name === "") {
      name = "root";
    } else
      netref += "/" + name;
    this.cd.append("/<a href='" + netref + "'>" + name + "</a>");
  }
};
FileBrowser.prototype.changeDirectory = function (href) {
  this.processCD(href);
  var list = pot.get(this.snapshot.filesystem,href);
  this.dirElem.empty();
  href = href === "/"?href:href+"/";
  var self = this;
  this.dirElem.removeClass("hidden");
  this.fileElem.addClass("hidden");
  Object.keys(list).forEach(function(name){
    console.log(name);
    var item = list[name];
    var el = jQuery("<li><a href='" + href+name + "'>" + name.replace(/%2E/,".") + "</a></li>");
    if (item._id) {
      el.addClass("file");
      el.addClass(item.mimeType.split("/").join("_"));
    } else {
      el.addClass("directory");
    }
    self.dirElem.append(el);
  });
};

FileBrowser.prototype.viewFile = function(href){
  this.processCD(href);
  var file = pot.get(this.snapshot.filesystem,href);
  var code = this.fileElem.children("code");
  code.empty();
  this.fileElem.removeClass("hidden");
  this.dirElem.addClass("hidden");
  addLoadingSpinner(this.fileElem);
  var self = this;
  //would like to stream to the dom here, but that makes little sense
  //I still need to format to
  console.log(file);
  sa.get(window.location.origin+"/"+file.parent+"/"+file._id.split("_")[1])
  .end(function(err,res){
    if(err) throw err;
    removeLoadingSpinner(self.fileElem);
    console.log(res);
    code.text(res.text);
    hljs.highlightBlock(code[0]);
  });
};

function addLoadingSpinner(){}
function removeLoadingSpinner(){}


module.exports = FileBrowser;
