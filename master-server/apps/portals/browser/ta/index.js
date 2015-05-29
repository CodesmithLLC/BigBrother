var StudentList = require("../../../student-monitor/browser/ta");
var HelpRequest = require("../../../help-request/browser/ta");
var jQuery = require("jquery");
window.addEventListener("load",function(){
  var sl = new StudentList();
  var hr = new HelpRequest();
  jQuery("body>header>.menu a").on("click",function(e){
    e.preventDefault();
    var el = jQuery("#"+jQuery(this).attr("href").substring(1));
    el.siblings().removeClass("shown");
    el.addClass("shown");
  });
  jQuery("#help-requests").append(hr.elem);
  jQuery("#student-monitor").append(sl.elem);
});
