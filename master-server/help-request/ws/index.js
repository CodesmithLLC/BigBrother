var HelpRequest = require("../models/HelpRequest");

module.exports = function(io){
  var taWS = require("./ta.js")(io);
  var stuWS = require("./student.js")(io);

  //we listen for when a new commit is created and re-emmit that out to the cluster emtter
  return function(ws){

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
};
