var HELP_STATES = [
  "none",
  "requesting",
  "recieving",
  "feedback"
];
var help_state = "none";

requestHelp.on("click",function(){
  if(requesting_help !== "none"){
    desktopNotifications.notify("We currently Your Help request has been submitted");
  }
  requesting_help = true;
  var prompt = createPrompt();
  var t = setTimeout(function(){
    prompt.close();
  },5000);
  //
  prompt.createTextArea("Give us a description of what you need help on");
  prompt.createFolderSelector("Choose your directory");
  prompt.on("hover",function(){
    clearTimeout(t);
  });
  prompt.on("blur",function(){
    t = setTimeout(function(){
      prompt.close();
    },5000);
  });
  prompt.on("submit",function(e){
    e.preventDefault();
    clearTimeout(t);
    var description = prompt.textArea;
    BIG_BROTHER.emit("send-help-request",{description:description},function(){
      desktopNotifications.notify("Your Help request has been submitted");
    });
  });
});

MASTER_SERVER.on("help-coming",function(helper){
  if(help_state === "none"){
    desktopNotifications.notify(
      "The TA "+helper.name+" believes you're having some trouble. "+
      "They will be contacting you "+(helper.remote?"online now.":"shortly")
    );
    help_state = "recieving";
    return;
  }
  if(help_state !== "requesting"){
    throw new Error("Help should not be coming");
  }
  desktopNotifications.notify(
    "The TA "+helper.name+" will be helping you with your problem. "+
    "They will be contacting you "+(helper.remote?"online now.":"shortly")
  );
  help_state = "recieving";
});
