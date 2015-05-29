var flashMessager = require("../../../Abstract/browser-flash");
var HR = require("../../../help-request/browser/student");
var jQuery = require("jquery");
requestAnimationFrame(function(){
  window.flash = flashMessager("#messages");
  var hr = new HR();
  jQuery("#help-request").append(hr.elem);
  require("../../../student-monitor/browser/student");
});
