var c3 = require("c3");
var sa = require("superagent");
var io = require("socket.io")();
var lazy = require("lazy.js");
var $ = require("jquery");

var studentTemplate = $("script.student-template").text();
var classRoomTemplate = $("script.classroom-template").text();

function Chart(elem){
  this.elem = $(elem);
  this.min_max = [Number.POSITIVE_INFINITY, Date.now()];
  this.currentClassRoom = void 0;
  this.availableClassRooms = {};
  var studentContain = this.elem.find(".students");
  var classroomContain = this.elem.find(".class_rooms");
  var chart = c3.generate({
    bindto: elem.find(".display")[0],
    data: {},
    subchart: {
      show: true,
      onbrush:this.onBrush.bind(this)
    }
  });
  this.initialize();
}

Chart.prototype.initialize = require("./initialize");

Chart.prototype.changeClassRoom = function(newclassroom){
  var self = this;
  this.chart.unload({
    ids: this.currentClassRoom.getKeys()
  });
  this.studentContain.clear();
  new Promise(function(){
    if(!(newclassroom in self.availableClassRooms)){
      self.availableClassRooms[newclassroom] = new ClassRoom(newclassroom);
    }
    return self.availableClassRooms[newclassroom];
  }).then(function(newclassroom){
    self.currentClassRoom = newclassroom;
    return newclassroom.getStudents();
  }).then(function(students){
    students.forEach(function(student){
      var studentDiv = studentTemplate.replace(/\{\{student\}\}/,student.name);
      studentDiv = studentTemplate.replace(/\{\{id\}\}/,student._id);
      self.studentContain.append(studentDiv);
    });
  }).then(function(){
    var max = Date.now();
    self.chart.axis.max({
        x:max
    });
    self.chart.axis.min({
      x:self.min
    });
    var range = [max - 1000*60*60*24,max];
    self.chart.zoom(range);
    return self.currentClassRoom.getStudentData(range,self.chart);
  });
};

Chart.prototype.onBrush = function(range){
  this.currentClassRoom.getStudentData(range,self.chart);
};


module.exports = Chart;
