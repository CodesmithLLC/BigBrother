var jQuery = require("jquery");
var path = "/";
var pot = require("../path-object-traversal");
var sa = require("superagent");
var hljs = require("highlight.js");
require("../../../Abstract/browserify-utils").appendCSS(fs.readFileSync(
  require.resolve("highlight.js")+"/styles/default.css"
));


function file_explorer(elem,snapshot) {
  if (typeof elem == "undefined")
    elem = "body";
  this.elem = jQuery(elem);
  this.dirElem = this.elem.find(".directory");
  this.fileElem = this.elem.find(".file");
  this.cd = this.elem.find(".current_path");
  this.href = "";
  var self = this;
  jQuery(this.elem).on("click", ".current_path a,.files .directory a", function (e) {
    e.preventDefault();
    self.changeDirectory($(this).attr("href"));
  });
  // open file when clicked
  jQuery(this.elem).on("click", ".files .file a", function (e) {
    e.preventDefault();
    self.viewFile($(this).attr("href"));
  });
  if(snapshot) return this.loadSnapshot(snapshot);
  /* This will likely be used later, though obviously not in these words
    this.listener = methods.listen("/list/path", function (err, list) {
      if (err) return alert(JSON.stringify(err));
      self.processList(self.href, list);
    });
   */
}

file_explorer.prototype.loadSnapshot = function(snapshot){
  this.snapshot = snapshot;
  this.changeDirectory("/");
};

file_explorer.prototype.processCD = function (href) {
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
file_explorer.prototype.changeDirectory = function (href) {
  this.processCD(href);
  var list = pot.get(this.snapshot.filesystem,href);
  this.dirElem.empty();
  href += "/";
  var self = this;
  this.dirElem.removeClass("hidden");
  this.fileElem.addClass("hidden");
  Object.keys(list).forEach(function(name){
    var item = list[name];
    var el = jQuery("<li><a href='" + href+name + "'>" + name + "</a></li>");
    if (item._id) {
      el.addClass("file");
      el.addClass(item.mimeType.split("/").join("_"));
    } else {
      el.addClass("directory");
    }
    self.dirElem.append(el);
  });
};

file_explorer.prototype.viewFile = function(href){
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
  sa.get(window.location.origin+"/"+file.parent+"/"+file.propName)
  .end(function(err,res){
    if(err) throw err;
    removeLoadingSpinner(self.fileElem);
    code.text(res.responseText);
    hljs.highlightBlock(code[0]);
  });
};

function addLoadingSpinner(){}
function removeLoadingSpinner(){}
