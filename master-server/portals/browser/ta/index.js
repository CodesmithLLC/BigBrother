var Student = require("../../../student-monitor/browser/ta/Student");
// var HelpRequest = require("../../../help-request/browser/ta");
var JSONStream = require("JSONStream");
var jQuery = require("jquery");
var sa = require("superagent");
var io = require("socket.io-client");
window.addEventListener("load",function(){
  /*
    var hr = new HelpRequest();
    var students = [];
    jQuery("#requests").append(hr.elem);
  */
  var stats = jQuery("#statistics");
  sa
  .get("/Student")
  .end(function(err,res){
    if(err) throw err;
    var studentrefs = {};
    res.body.forEach(function(student){
      student = new Student(student);
      stats.append(student.elem);
      studentrefs[student._id] = student;
    });
    var live = io(window.location.origin+"/student-monitor");
    live.on("fsdiff",function(diff){
      console.log("fsdiff",diff);
      studentrefs[diff.student._id||diff.student].chart.insert("File Change",diff);
    });
    live.on("commit",function(diff){
      console.log("commit");
      studentrefs[diff.student._id||diff.student].chart.insert("Commit",diff);
    });
  });

});
