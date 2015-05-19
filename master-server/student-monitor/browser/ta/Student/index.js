var fs = require("fs");
var template = fs.readFileSync(__dirname+"/view.html",'utf8');
var Chart = require("../../../../Abstract/webworker-chart");
var mutils = require("../../../../Abstract/mongooseUtils");
var sa = require("superagent");
var jQuery = require("jquery");
var Mustache = require("mustache");
var moment = require("moment");
Mustache.parse(template);

function Student(student){
  this._id = student._id;
  this.elem = jQuery(Mustache.render(template,student));
  var self = this;
  sa
  .get("/Student/"+this._id+"/FSDiff",{sort:"createdAt",ipp:1,select:"createdAt"})
  .end(function(err,res){
    if(err) throw err;
    var d = Date.now();
    var ca = res.body[0].createdAt;
    self.chart = new Chart(
      self.elem.find(".chart"),
      "createdAt",
      "diffObj.total",
      res.body.createdAt,
      d,
      [Math.min(ca,d - 1000*60*60*24),d]
    );
    self.chart.addURL("/Student/"+self._id+"/FSDiff");
    self.chart.addURL("/Student/"+self._id+"/Commit");
  });
}

function getTimeStamp(){

}

module.exports = Student;
