var Student = require("./Student");
var jQuery = require("jquery");
var sa = require("superagent");
var io = require("socket.io-client");
function StudentList(){
  this.elem = jQuery("<div></div>");
  var self = this;
  sa
  .get("/Student")
  .end(function(err,res){
    if(err) throw err;
    var studentrefs = {};
    res.body.forEach(function(student){
      student = new Student(student);
      self.elem.append(student.elem);
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
}

module.exports = StudentList;
