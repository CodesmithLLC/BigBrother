
var fs = require("fs");
var template = fs.readFileSync(__dirname+"/view.html",'utf8');
var templateTransfrom = require("../../../../Abstract/browserify-utils.js").renderTemplate;
var Chart = require("../../../../Abstract/webworker-chart");
var sa = require("superagent");

function Student(student){
  this._id = student._id;
  this.elem = templateTransfrom(template,student)[0];
  var self = this;
  sa
  .get("/students/"+this._id+"/diffs",{sort:"-createdAt",ipp:1,populate:"createdAt"})
  .end(function(err,res){
    if(err) throw err;
    var d = Date.now();
    self.chart = new Chart(
      this.elem.querySelector(".chart"),
      "createdAt",
      "diff_num",
      parseInt(res.responseText),d,
      [d - 1000*60*60*24,d]
    );
  });
}

module.exports = Student;
