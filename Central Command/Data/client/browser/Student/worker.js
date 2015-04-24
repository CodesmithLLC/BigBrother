var lazy = require("lazy.js");
var sa = require("superagent");
var async = require("async");
var JSONStream = require("JSONStream");
var student;

var x_data = [];
var y_data = [];


self.addEventListener("message",function(e){
  if(e.data.event !== "initialize") return;
  student = e.data.data;
});

self.addEventListener("message",function(e){
  if(e.data.event !== "requestRange") return;
  var ranges = e.data.data.ranges;
  var type = e.data.data.type;
  var url = "/students/"+student._id+"/"+type;
  async.map(ranges,function(item,next){
    sa.request(url+"?min="+item[0]+"&max="+item[1])
    .buffer(false)
    .end(function(err,res){
      if(err) return next(err);
      var x = [];
      var y = [];
      res.pipe(JSONStream.parse("*"))
      .on("data",function(item){
        x.push(item.createdAt);
        y.push(item.value);
      }).on("finish",function(){
        next(void 0, [x,y]);
      }).on("error",next);
    });
  },function(err,items){
    if(e.data.data.length == 2){
      x_data = e.data.data[0][0].concat(self.x_data).concat(e.data.data[1][0]);
      y_data = e.data.data[0][1].concat(self.y_data).concat(e.data.data[1][1]);
    }else if(e.data.data[0][0][0] < self.x_data[0]){
      x_data = e.data.data[0][0].concat(self.x_data);
      y_data = e.data.data[0][1].concat(self.y_data);
    }else{
      x_data = self.x_data.concat(e.data.data[0][0]);
      y_data = self.y_data.concat(e.data.data[0][1]);
    }
    var ret = [];
    ret.push([self.id+"_x"].concat(x_data));
    ret.push([self.id+"_y"].concat(y_data));

    self.postMessage({
      event:e.data.id,
      error:err,
      data:ret
    });
  });
});
