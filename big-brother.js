// #! node
/*
  npm install -g codesmith
  codesmith bigbrother

	https://www.npmjs.com/package/background-service-runner

*/
var CentralCommand = require("./CentralCommand");


var app = require("express")();

var notifier = require('node-notifier');
var path = require('path');

 
var user;

app.get("/",function(){
	
});

app.get("login",function(current_user){
  user = current_user;
  CentralCommand.post("/login", user,function(){
		notifier.notify({
			title: 'Logged In',
			message: 'Hello from Big Brother, '+user.name+'! \n Big Brother is now watching you ;)',
			icon: path.join(__dirname, 'coulson.jpg'), // absolute path (not balloons)
		});
	});
});
 
app.get("logout",function(){
	user = void(0);
  CentralCommand.post("/logout", function(){
		notifier.notify({
			title: 'Logged out',
			message: 'Goodbye '+user.name+'. \n You may leave, but Big Brother will still be watching you.',
			icon: path.join(__dirname, 'coulson.jpg'), // absolute path (not balloons)
		});
	});
});
 
app.get("help", function(request){
  if(!user) return;
  CentralCommand.get("/helpRequest", request, function(help){
    if(help.type === "remote"){
			notifier.notify({
				title: 'Help!',
				message: "Don't fear! Big Brother is having the TA "+help.TA.name+" help you remotely. \n Go to "+help.help_url,
				icon: path.join(__dirname, 'coulson.jpg'), // absolute path (not balloons)
			});
      //Make the whole thing an anchor
    }
    if(help.type === "local"){
			notifier.notify({
				title: 'Help!',
				message: "Don't fear! Big Brother is sending the TA "+help.TA.name+" to help you. \n Yell at them if they take too long",
				icon: path.join(__dirname, 'coulson.jpg'), // absolute path (not balloons)
			});
    }
  });
});
 


/*
//https://github.com/Bornholm/node-keyboard

//https://github.com/arvydas/node-hid/tree/develop
var kbs = checkForAvailableKeyboards();
 
kbs.forEach(function(kb){
  kb.on("stroke", function(){
    kb.apmUpdate(); //pretty difficult
    kb.lastStroke = Date.now();
  });
})
 
setInterval(function(){
  var main_and_helper = findCurrentMainAndHelper(kbs);
  if(main_and_helper.helper.lastInteraction() > 30*1000*60){
    displayDesktopNotification("Should Switch Keyboard");
  }
});
 */
