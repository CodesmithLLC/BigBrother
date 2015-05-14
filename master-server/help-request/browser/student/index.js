var sa = require("superagent");
var io = require("socket.io-client");

var HELP_STATES = [
  "none",
  "requesting",
  "recieving",
  "feedback"
];

function HelpButton(form){
  var self = this;
  this.io = io("/help-request");
  this.form = form;
  form.on("submit",function(e){
    if(requesting_help !== "none"){
      return flash("We currently Your Help request has been submitted");
    }
    sa.post(
      local_big_brother_url+"/send-help-request",
      new FormData(e.target))
    .end(function(err,res){
      if(err) throw err;
      flash("Your Help request has been submitted");
    });
  });
  io.on("help-state",function(state){
    self.state = state;
  });
  io.on("help-coming",function(helper){
    if(self.state === "none"){
      flash(
        "A TA is coming to you",
        "The TA "+helper.name+" believes you're having some trouble. "+
        "They will be contacting you "+(helper.remote?"online now.":"shortly")
      );
      self.state = "recieving";
      return;
    }
    if(self.state !== "requesting"){
      throw new Error("Help should not be coming");
    }
    flash(
      "A TA will help you",
      "The TA "+helper.name+" will be helping you with your problem. "+
      "They will be contacting you "+(helper.remote?"online now.":"shortly")
    );
    self.state = "recieving";
  });
}

module.exports = HelpButton;
