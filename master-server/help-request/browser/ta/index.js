var fs = require("fs");
var template = fs.readFileSync(__dirname+"/List/template.html","utf8");
var Mustache = require("mustache");
Mustache.parse(template);

var HelpRequest = require("./HelpRequest");
var io = require("socket.io-client");
var sa = require("superagent");
var FileBrowser = require("../../../Abstract/file-browser");

var jQuery = require("jquery");

function HelpList(){
  var self = this;
  this.browser = new FileBrowser();
  var back = jQuery("<a href='#'>Back to List</a>");
  back.on("click",function(e){
    e.preventDefault();
    self.browser.elem.addClass("hidden");
    self.list.removeClass("hidden");
  });
  this.browser.elem.prepend(back);
  this.browser.elem.addClass("hidden");
  this.requests = {};
  this.elem = jQuery(Mustache.render(template));
  this.list = this.elem.find(".help-list");
  this.currentRequest = void 0;
  this.io = io(window.location.origin+"/help-request");
  this.io.on("request",self.addHelp.bind(self));
  this.io.on("help-taken",function(help_id){
    self.requests[help_id].elem.remove();
    delete self.requests[help_id];
  });
  sa.get("/HelpRequest?populate=student&sort=-createdOn").end(function(err,res){
    if(err) throw err;
    console.log(res);
    self.elem.find(".file-browser").append(self.browser.elem);
    var i = setInterval(function(){
      if(res.body.length === 0) return clearInterval(i);
      self.addHelp(res.body.pop());
    },10);
  });
}

HelpList.prototype.addHelp = function(help){
  console.log("adding help");
  if(help._id in this.requests){
    return this.requests[help._id].update(help);
  }
  help = this.requests[help._id] = new HelpRequest(help);
  this.list.append(help.elem);
  var self = this;
  help.elem.on("click",function(e){
    e.preventDefault();
    if(!(help._id in self.requests)) throw new Error("non existant help request");
    if(self.currentRequest === help) return;
    self.list.addClass("hidden");
    self.browser.elem.removeClass("hidden");
    self.currentRequest = help;
    self.browser.loadSnapshot(help.snapshot);
  });
};

module.exports = HelpList;
