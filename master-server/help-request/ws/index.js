var mongoose = require("mongoose");
var Student = require("../portals/models/student");

var taWS = require("./ta.js");
var stuWS = require("./student.js");

module.exports = function(ws){
  if(!ws.request.user){
    return ws.disconnect();
  }
  var roles = ws.request.user.roles;
  for(var i=0,l=roles.length;i<l;i++){
    switch(roles[i]){
      case "teachers_assistant":
        return taWS(ws);
      case "student":
        return stuWS(ws);
    }
  }
};

//we listen for when a new commit is created and re-emmit that out to the cluster emtter
var HelpRequest = require("./models/HelpRequest");
HelpRequest.schema.post("create",function(commit){
  mongoose.ee.emit('help-request:create', commit);
});
