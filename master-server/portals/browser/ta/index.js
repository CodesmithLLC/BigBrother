var Student = require("../../../student-monitor/browser/ta/Student");
var HelpRequest = require("../../../help-request/browser/ta");
var JSONStream = require("JSONStream");
var jQuery = require("jquery");
var sa = require("superagent");
requestAnimationFrame(function(){
  var hr = new HelpRequest();
  var students = [];
  jQuery("#requests").append(hr.elem);
  var stats = jQuery("#statistics");
  sa
  .get("/Student")
  .end(function(err,res){
    if(err) throw err;
    res.body.forEach(function(student){
      student = new Student(student);
      stats.append(student.elem);
    });
  });
});
