var io = require("socket.io-client");
var async = require("async");
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
    if(e.data.event !== "live") return;
    var l = x_data.length - 1, item = e.data.data, x = mpath.get(x_key,item);
    if(x_data.length === 0){
      appendJson2Arrays(item,x_data,y_data);
      return sendBatch();
    }
    if(x_data[l] < x){
      appendJson2Arrays(item,x_data,y_data);
      return sendBatch();
    }
    if(x_data[0] > x){
      x_data.unshift(x);
      y_data.unshift(mpath.get(y_key,item));
      return sendBatch();
    }
    //I should make this a binary search
    while(l--){
      if(x_data[l] < item[x_key]){
        x_data.splice(l,0,x);
        y_data.splice(l,0,mpath.get(y_key,item));
        return sendBatch();
      }
    }
  });

  self.addEventListener("message",function(e){
    if(e.data.event !== "initialize") return;
    if(url) throw new Error("already initialized");
    url = e.data.data.url;
    x_key = e.data.data.x_key;
    y_key = e.data.data.y_key;
    name = e.data.data.name;
    console.log(url,name);

  });


  self.addEventListener("message",function(e){
    if(e.data.event !== "ranges") return;
    var ranges = e.data.data;
    async.map(ranges,function(item,next){
      var req = new XMLHttpRequest();
      console.log(
        self.location.origin+url+"?min="+item[0]+"&max="+item[1]+"&sort="+x_key
      );
      req.open("GET", self.location.origin+url+
        "?min="+item[0]+
        "&max="+item[1]+
        "&sort=-"+x_key,
      true);
      req.send();
      req.addEventListener("error",next);
      req.addEventListener("load",function(e){
        console.log(req.response);
        if(req.status !== 200) return;
        var x = [];
        var y = [];
        JSON.parse(req.response).forEach(function(item){
          appendJson2Arrays(item,x,y);
        });
        next(void 0, [x,y]);
      });
    },function(err,items){
      if(err){
        self.postMessage({
          event:"error",
          error:err.stack
        });
        throw err;
      }
      console.log(items);
      if(items.length === 0) return;
      if(e.data.data.length == 2){
        x_data = items[0][0].concat(x_data).concat(items[1][0]);
        y_data = items[0][1].concat(y_data).concat(items[1][1]);
      }else if(items[0][0][0] < x_data[0]){
        x_data = items[0][0].concat(x_data);
        y_data = items[0][1].concat(y_data);
      }else{
        x_data = x_data.concat(items[0][0]);
        y_data = y_data.concat(items[0][1]);
      }
      sendBatch();
    });
  });

  function sendBatch(){
    var ret = [];
    ret.push([name+"_x"].concat(x_data));
    ret.push([name+"_y"].concat(y_data));

    self.postMessage({
      event:"batch",
      data:ret
    });
  }


};
