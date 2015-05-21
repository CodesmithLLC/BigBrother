var fs = require("fs");
var template = fs.readFileSync(__dirname+"/view.html",'utf8');
var Chart = require("../../../../Abstract/webworker-chart");
var mutils = require("../../../../Abstract/mongooseUtils");
var sa = require("superagent");
var jQuery = require("jquery");
var Mustache = require("mustache");
Mustache.parse(template);

function Student(student){
  console.log(student);
  this._id = student._id;
  this.elem = jQuery(Mustache.render(template,student));
  var self = this;
  sa
  .get("/Student/"+this._id+"/FSDiff",{sort:"createdAt",ipp:1,select:"createdAt"})
  .end(function(err,res){
    if(err) throw err;
    var d = Date.now();
    var min = d - 1000*60*60;
    var ca = res.body.length?res.body[0].createdAt:min;
    self.chart = new Chart(
      self.elem.find(".chart"),
      "createdAt",
      "diffObj.total",
      {
        x:{
          min:ca,
          max:d,
          tick: {
              format: function (x) { return new Date(x).toLocaleString(); }
          }
        }
      },
      [Math.min(ca,min),d]
    );
    self.chart.addURL("/Student/"+self._id+"/FSDiff","file change");
    self.chart.addURL("/Student/"+self._id+"/Commit","Commit");
  });
}

function getTimeStamp(){

}

module.exports = Student;
