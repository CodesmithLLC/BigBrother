var fs = require("fs");
var temp = fs.readFileSync(require.resolve("c3/c3.css"),"utf8");
var c3 = require("c3");
var utils = require("../browserify-utils.js");
utils.appendCSS(temp);

var work = require("webworkify");
var workerScript = require("./worker");
var mpath = require("mpath");

function Chart(elem,x_key,y_key,axis,zoom){
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
    },
    zoom: {
      extent: zoom
    },
    axis:axis
  });
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
  curwork.worker.postMessage({
    event:"ranges",
    data:[this.curRange]
  });
};

Chart.prototype.requestRanges = function(requestedRange){
  var requests = [];
  console.log(requestedRange);
  console.log(this.curRange);
  if(requestedRange[0] < this.curRange[0]){
    requests.push([requestedRange[0],this.curRange[0]]);
    this.curRange[0] = requestedRange[0];
  }
  if(requestedRange[1] > this.curRange[1]){
    requests.push([this.curRange[1],requestedRange[1]]);
    this.curRange[1] = requestedRange[1];
  }
  if(requests.length === 0) return;
  this.workers.forEach(function(worker){
    worker.worker.postMessage({
      event:"ranges",
      data:requests
    });
  });
};

Chart.prototype.insert = function(name,item){
  var x = mpath.get(this.x_key,item);
  console.log(name,x);
  var chart = this.chart;
  for(var i=0,l=this.workers.length;i<l;i++){
    if(this.workers[i].name !== name) continue;
    var max = chart.axis.max().x;
    console.log(chart.zoom(), x, max);
    if(chart.zoom()[1] >= max){
      chart.axis.max({
          x: max = x
      });
      console.log(x,mpath.get(this.y_key,item));
      chart.flow({
        columns: [
          [name+"_x",x],
          [name+"_y",mpath.get(this.y_key,item)]
        ],
        length: 1,
        duration:250,
        done:console.log.bind(console,"done")
      });
    }
    this.workers[i].worker.postMessage({
      event:"live",
      data:item
    });
    return;
  }
};

module.exports = Chart;
