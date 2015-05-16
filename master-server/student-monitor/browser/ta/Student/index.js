var fs = require("fs");
var template = fs.readFileSync(__dirname+"/view.html",'utf8');
var templateTransfrom = require("../../../../Abstract/browserify-utils.js").renderTemplate;
var Chart = require("../../../../Abstract/webworker-chart");
var sa = require("superagent");
var jQuery = require("jquery");
var Mustache = require("mustache");
Mustache.parse(template);

function Student(student){
  this._id = student._id;
  this.elem = jQuery(Mustache.render(template,student));
  var self = this;
  sa
  .get("/Student/"+this._id+"/FSDiff",{sort:"-createdAt",ipp:1,populate:"createdAt"})
  .end(function(err,res){
    if(err) throw err;
    var d = Date.now();
    self.chart = new Chart(
      self.elem.find(".chart"),
      "createdAt",
      "diff_num",
      parseInt(res.responseText),d,
      [d - 1000*60*60*24,d]
    );
  });
}

module.exports = Student;
