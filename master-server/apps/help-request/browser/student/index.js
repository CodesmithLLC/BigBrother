var sa = require("superagent");
var sio = require("socket.io-client");
var jQuery = require("jquery");
var fs = require("fs");
var template = fs.readFileSync(__dirname+"/template.html","utf8");
var currentHelp = fs.readFileSync(__dirname+"/current-help.html","utf8");

var HELP_STATES = [
  "none",
  "requesting",
  "recieving",
  "feedback"
];

function HelpButton(){
  var state = "none";
  var io = sio(window.location.origin+"/help-request");
  this.elem = jQuery("<div></div>");
  var cancel = jQuery("<button>Cancel</button>");
  var form = jQuery(template);
  var curr = jQuery(currentHelp);
  this.elem.append(form);
  this.elem.append(curr);
  this.elem.append(cancel);
  form.on("submit",function(e){
    e.preventDefault();
    if(state !== "none"){
      return flash("Your help request has already been submitted");
    }
    console.log(this);
    sa.post(
      local_big_brother_url+"/send-help-request"
    ).send(
      {description:jQuery(this).find("[name=description]").val()}
    ).end(function(err,res){
      if(err) throw err;
      flash("Your Help request has been submitted");
    });
  });
  curr.on("submit",function(e){
    e.preventDefault();
    if(state === "none"){
      return flash("You're not currently requesting help");
    }
    var boo = jQuery(this).find("[name=succeeded]:checked").val();
    if(boo == 1){
      io.emit("help-solve");
    }else{
      io.emit("help-fail");
    }
  });
  io.on("help-aware",function(){
    state = "requesting";
    console.log("awa");
    cancel.siblings().addClass("hidden");
    cancel.removeClass("hidden");
  });
  io.on("help-finish",function(){
    state = "none";
    form.siblings().addClass("hidden");
    form.removeClass("hidden");
  });
  io.on("help-here",function(){
    console.log("tak");
    curr.siblings().addClass("hidden");
    curr.removeClass("hidden");
  });
  io.on("help-here",function(helper){
    if(state === "none"){
      flash(
        "A TA is coming to you",
        "The TA "+helper.name+" believes you're having some trouble. "+
        "They will be contacting you "+(helper.remote?"online now.":"shortly")
      );
      state = "recieving";
      return;
    }
    if(state !== "requesting"){
      throw new Error("Help should not be coming");
    }
    flash(
      "A TA will help you",
      "The TA "+helper.name+" will be helping you with your problem. "+
      "They will be contacting you "+(helper.remote?"online now.":"shortly")
    );
    state = "recieving";
  });
}

module.exports = HelpButton;
