var sa = require("superagent");
var sio = require("socket.io-client");
var jQuery = require("jquery");

var HELP_STATES = [
  "none",
  "requesting",
  "recieving",
  "feedback"
];

function HelpButton(form){
  var state = "none";
  var io = sio(window.location.origin+"/help-request");
  form = jQuery(form);
  form.on("submit",function(e){
    e.preventDefault();
    if(state !== "none"){
      return flash("We currently Your Help request has been submitted");
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
  io.on("help-state",function(new_state){
    state = new_state;
  });
  io.on("help-coming",function(helper){
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
