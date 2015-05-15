var flashMessager = require("../../../Abstract/browser-flash");

requestAnimationFrame(function(){
  window.flash = flashMessager("#messages");
  require("../../../help-request/browser/student")("#request-help");
  require("../../../student-monitor/browser/student");
});
