var fs = require("fs");
var template = fs.readFileSync(__dirname+"/view.html",'utf8');
var sa = require("superagent");
var Student = require("../Student");
var templateTransfrom = require("../../../../Abstract/browserify-utils.js").renderTemplate;

function ClassRoom(classroomname){
  this.currentRange = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
  this.max_range = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
  this.students = [];
  this.name = classroomname;
  this.elem = templateTransform(template,classroomname);
}

ClassRoom.prototype.getStudents = function(){
  var self = this;
  return new Promise(function(rej,ful){
    if(self.students.length > 0) return ful(self.students);
    sa.get("/students",{classroom:this.name}).end(function(err,res){
      if(err) return rej(err);
      res.response.forEach(function(student){
        self.students.push(new Student(student));
      });
      ful(self.students);
    });
  });
};

ClassRoom.prototype.getKeys = function(){
  var keys = [];
  this.students.forEach(function(student){
    keys.push(student._id+"_x",student._id+"_y");
  });
  return keys;
};

ClassRoom.prototype.getStudentData = function(requestedRange,chart){
  var requests = [];
  if(requestedRange[0] < this.currentRange[0]){
    requests.push([requestedRange[0],this.currentRange[0]]);
    this.currentRange[0] = requestedRange[0];
  }
  if(requestedRange[1] > this.currentRange[1]){
    requests.push([requestedRange[1],this.currentRange[1]]);
    this.currentRange[1] = requestedRange[1];
  }
  if(requestedRange.length === 0) return;
  this.students.forEach(function(student){
    student.loadRanges(type,requests,function(err,columns){
      if(err) throw err;
      chart.load({ columns: columns });
    });
  });
};


module.exports = ClassRoom;
