var sa = require("superagent");
var parse = require("tar-parse");
var toBuffer = require("typedarray-to-buffer");

var structure = {};
var initialized = false;
var queue = [];

self.addEventListener("message",function(e){
  if(e.data.event !== "initialize") return;
  if(initialized) return;
  sa.get("/HelpRequest/"+e.data.data._id)
  .on('request', function () {
    this.xhr.responseType = 'arraybuffer';
  }).end(function(err,res){
    if(err) return console.error(err);
    var p = parse();
    p.on("data",function(entry){
      structure[entry.path] = new Buffer();
      entry.on("data",function(buffer){
        structure[entry.path] = Buffer.concat(structure[entry.path],buffer);
      });
      entry.resume();
    }).on("finish",function(){
      initialized = true;
      while(queue.length) handlePath(queue.shift());
    });
    p.write(toBuffer(new Uint8Array(res.response)));
  });
});

self.addEventListener("message",function(e){
  if(e.data.event !== "path") return;
  if(!initialized){
    queue.push(e.data);
  }
  handlePath(e.data);
});

function handlePath(data){
  if(!(data.path in structure)){
    return self.postMessage({
      event:data.id,
      error: "this file does not exist"
    });
  }
  return self.postMessage({
    event:data.id,
    data: structure[data.path].toArrayBuffer()
  });
}
