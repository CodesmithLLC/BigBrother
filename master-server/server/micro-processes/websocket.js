

module.exports = function setupWebsocket(obj,config,next){
  var sm = obj.ws.of("/student-monitor");
  sm.on("connect",require("../../apps/student-monitor/ws")(sm));
  var ns = obj.ws.of("/help-request");
  ns.on("connect",require("../../apps/help-request/ws")(ns));
  next();
};
