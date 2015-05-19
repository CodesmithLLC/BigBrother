var fs = require("fs");
var temp = fs.readFileSync(require.resolve("c3/c3.css"),"utf8");
var c3 = require("c3");
var utils = require("../browserify-utils.js");
utils.appendCSS(temp);

var work = require("webworkify");
var workerScript = require("./worker");

function Chart(elem,x_key,y_key,min,max,zoom){
  this.elem = elem;
  this.chart = c3.generate({
    bindto: elem[0],
    data: {
      xs: {},
      columns: []
    },
    subchart: {
      show: true,
      onbrush:this.requestRanges.bind(this)
    }
  });
  this.min = min;
  this.max = max;
  this.chart.axis.max({
      x:max
  });
  this.chart.axis.min({
    x:min
  });
  this.chart.zoom(zoom);
  this.curRange = zoom;
  this.x_key = x_key;
  this.y_key = y_key;
  this.workers = [];
}

Chart.prototype.remove = function(url_or_name){
  var chart = this.chart;
  var worker;
  for(var i=0,l=this.workers.length;i<l;i++){
    worker = this.workers[i];
    if( worker.name != url_or_name &&
        worker.url != url_or_name
    ) continue;
    worker.worker.terminate();
    chart.load({unload:[worker.name+"_x",worker.name+"_y"]});
    this.workers.splice(i,1);
    return;
  }
  throw new Error("this name or url does not exist");
};

Chart.prototype.addURL =function(url,name){
  var chart = this.chart;
  var self = this;
  var curwork;
  var xs = {};
  xs[name+"_y"] = name+"_x";
  chart.load({xs: xs});
  var names = {};
  names[name+"_y"] = name;
  chart.data.names(names);

  this.workers.push(curwork = {
    name:name,
    worker: work(workerScript),
    url:url
  });
  curwork.worker.postMessage({
    event:"initialize",
    data:{
      url:url,
      x_key:this.x_key,
      y_key:this.y_key,
      name:name
    }
  });

  curwork.worker.addEventListener("message",function(e){
    if(e.data.event === "batch"){
      chart.load({
        columns: e.data.data
      });
    }
  });
  curwork.worker.addEventListener("message",function(e){
    if(e.data.event === "live" && chart.zoom().x >= self.max){
      chart.axis.max({
          x: self.max = e.data.data[e.data.data.length-1][0]
      });

      chart.flow({
        columns: e.data.data,
        length: 0,
        duration:250,
        done:function(){
          console.log("done");
        }
      });
    }
  });
  curwork.worker.postMessage({
    event:"ranges",
    data:[this.curRange]
  });
};

Chart.prototype.requestRanges = function(requestedRange){
  var requests = [];
  console.log(requestedRange);
  console.log(this.curRange);
  if(requestedRange[0] < this.currentRange[0]){
    requests.push([requestedRange[0],this.curRange[0]]);
    this.curRange[0] = requestedRange[0];
  }
  if(requestedRange[1] > this.currentRange[1]){
    requests.push([this.curRange[1],requestedRange[1]]);
    this.curRange[1] = requestedRange[1];
  }
  if(requestedRange.length === 0) return;
  this.workers.forEach(function(worker){
    worker.worker.postMessage({
      event:"ranges",
      data:requests
    });
  });
};

module.exports = Chart;
