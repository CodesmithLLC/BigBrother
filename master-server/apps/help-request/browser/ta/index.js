var fs = require("fs");
var template = fs.readFileSync(__dirname+"/List/template.html","utf8");
var Mustache = require("mustache");
Mustache.parse(template);

var HelpRequest = require("./HelpRequest");
var TakenRequest = require("./TakenRequest");
var io = require("socket.io-client");
var sa = require("superagent");
var FileBrowser = require("../../../../Abstract/file-browser");

var jQuery = require("jquery");

function HelpList(){
  var self = this;
  this.browser = new FileBrowser();
  this.browser.elem.addClass("hidden");
  this.requests = {};
  this.elem = jQuery(Mustache.render(template));
  this.takenRequest = new TakenRequest();
  this.elem.children(".taken-help").append(this.takenRequest.elem);
  this.allList = this.elem.children(".not-helping");
  this.list = this.elem.find(".help-list");
  this.list.addClass("shown");
  this.allList.find(".file-browser").append(this.browser.elem);
  this.allList.children(".menu").on("click", "a",function(){

  });
  this.list.on("click", "li button.view-files",function(e){
    e.preventDefault();
    var id = jQuery(this).closest("li").attr("data-id");
    if(!(id in self.requests)) throw new Error("non existant help request");
    var help = self.requests[id];
    self.list.addClass("hidden");
    self.browser.elem.removeClass("hidden");
    if(self.currentRequest === help) return;
    self.currentRequest = help;
    self.browser.loadSnapshot(help.snapshot);
  });
  this.list.on("click", "li button.take",function(e){
    var id = jQuery(this).closest("li").attr("data-id");
    self.io.emit("help-take",id);
  });
  this.io = io(window.location.origin+"/help-request");
  this.setupTaken();
  this.setupList();
}

HelpList.prototype.setupTaken = function(){
  var self = this;
  this.io.on("go-help",function(help){
    console.log("go help");
    self.takenRequest.set(help);
    var cur = self.elem.children(".taken-help");
    cur.siblings().removeClass("shown");
    cur.addClass("shown");
  });
  this.io.on("end-help",function(){
    console.log("end-help");
    self.takenRequest.empty();
    var cur = self.elem.children(".not-helping");
    cur.siblings().removeClass("shown");
    cur.addClass("shown");
  });
};

HelpList.prototype.setupList = function(){
  var self = this;
  this.io.on("request",self.addHelp.bind(self));
  this.io.on("help-taken",function(help_id){
    console.log("taken");
    self.requests[help_id].elem.remove();
    delete self.requests[help_id];
  });
  sa.get("/HelpRequest?populate=student&sort=-createdOn").end(function(err,res){
    if(err) throw err;
    var i = setInterval(function(){
      if(res.body.length === 0) return clearInterval(i);
      self.addHelp(res.body.pop());
    },10);
  });
};

HelpList.prototype.addHelp = function(help){
  if(help._id === this.takenRequest._id){
    self.takenRequest.empty();
    var cur = self.elem.children(".not-helping");
    cur.siblings().removeClass("shown");
    cur.addClass("shown");
  }
  if(help._id in this.requests){
    return this.requests[help._id].update(help);
  }
  help = this.requests[help._id] = new HelpRequest(help);
  this.list.append(help.elem);
};

module.exports = HelpList;
