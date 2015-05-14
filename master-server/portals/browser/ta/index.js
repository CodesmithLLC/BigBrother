var Student = require("../../../student-monitor/browser/ta/Student");
var HelpRequest = require("../../../help-request/browser/ta");
var JSONStream = require("JSONStream");
requestAnimationFrame(function(){
  var hr = new HelpRequest();
  var students = [];
  document.querySelector("#requests").append(hr.elem);
  var stats = document.querySelector("#statistics");
  sa
  .get("/students")
  .buffer(false)
  .end(function(err,res){
    if(err) throw err;
    res.pipe(JSONStream("*"))
    .on("data",function(student){
      student = new Student(student);
      stats.append(student.elem);
    });
  });
});
