var Chart = require("../../../student-monitor/browser/ta/Chart");

requestAnimationFram(function(){
  var chart = new Chart();
  document.querySelector("#statistics").append(chart.elem);
});
