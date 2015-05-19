var sa = require("superagent");
var io = require("socket.io-client");
var async = require("async");
var JSONStream = require("JSONStream");
var mpath = require("mpath");


module.exports = function(self){
  var url;
  var live;
  var x_key;
  var y_key;
  var name;
  function appendJson2Arrays(json,xari,yari){
    xari.push(mpath.get(x_key, json));
    yari.push(mpath.get(y_key, json));
  }

  var x_data = [];
  var y_data = [];


  self.addEventListener("message",function(e){
    console.log(e);
    if(e.data.event !== "initialize") return;
    if(url) throw new Error("already initialized");
    url = e.data.data.url;
    x_key = e.data.data.x_key;
    y_key = e.data.data.y_key;
    name = e.data.data.name;
    live = io(path);
    live.on("update",function(item){
      var l = x_data.length - 1;
      if(x_data[l] < item[x_key]){
        appendJson2Arrays(item,x_data,y_data);
      }
      while(l--){
        if(x_data[l] < item[x_key]){
          x_data.splice(l,0,item[x_key]);
          y_data.splice(l,0,item[y_key]);
        }
      }
      self.postMessage({
        event:"live",
        data:[
          [name+"_x",item[x_key]],
          [name+"_y",item[y_key]]
        ]
      });
    });
  });


  self.addEventListener("message",function(e){
    if(e.data.event !== "requestRange") return;
    var ranges = e.data.data.ranges;
    var type = e.data.data.type;
    async.map(ranges,function(item,next){
      sa.get(url,{min:item[0],max:item[1],sort:x_key})
      .buffer(false)
      .end(function(err,res){
        if(err) throw err;
        var x = [];
        var y = [];
        res.pipe(JSONStream.parse("*"))
        .on("data",function(item){
          appendJson2Arrays(item,x,y);
        }).on("finish",function(){
          next(void 0, [x,y]);
        }).on("error",next);
      });
    },function(err,items){
      if(err) return self.postMessage({
        event:"error",
        error:err
      });
      if(e.data.data.length == 2){
        x_data = e.data.data[0][0].concat(x_data).concat(e.data.data[1][0]);
        y_data = e.data.data[0][1].concat(y_data).concat(e.data.data[1][1]);
      }else if(e.data.data[0][0][0] < x_data[0]){
        x_data = e.data.data[0][0].concat(x_data);
        y_data = e.data.data[0][1].concat(y_data);
      }else{
        x_data = x_data.concat(e.data.data[0][0]);
        y_data = y_data.concat(e.data.data[0][1]);
      }
      var ret = [];
      ret.push([name+"_x"].concat(x_data));
      ret.push([name+"_y"].concat(y_data));

      self.postMessage({
        event:"batch",
        data:ret
      });
    });
  });


};
