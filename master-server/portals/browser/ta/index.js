var Chart = require("../../../student-monitor/browser/ta/Chart");
var HelpRequest = require("../../../help-request/browser/ta/Chart");

requestAnimationFram(function(){
  var chart = new Chart();
  document.querySelector("#statistics").append(chart.elem);
  var hr = new HelpRequest();
  document.querySelector("#requests").append(hr.elem);
});
