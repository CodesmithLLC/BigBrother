require("c3/c3.css");
var c3 = require("c3");
var lazy = require("lazy.js");
var templateTransfrom = require("../../../../Abstract/template.js");

var Classroom = require("../ClassRoom");
var template = require("./view.html");

function Chart(){
  this.elem = templateTransfrom(template,{})[0];
  this.min_max = [Number.POSITIVE_INFINITY, Date.now()];
  this.currentClassRoom = void 0;
  this.classrooms = {};
  this.studentContain = this.elem.find(".students");
  this.classroomContain = this.elem.find(".class_rooms");
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
  if(this.currentClassRoom){
    if(newclassroom === currentClassRoom.name) return;
    this.chart.unload({
      ids: this.currentClassRoom.getKeys()
    });
  }
  this.studentContain.clear();
  this.currentClassRoom = this.classrooms[newclassroom];
  this.currentClassRoom.getStudents()
  .then(function(students){
    students.forEach(function(student){
      self.studentContain.append(student.elem);
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
