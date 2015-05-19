var parse = require("tar-parse");
var Readable = require("stream").Readable;
var fs = require("browserify-fs");


module.exports = function(self){
  var structure = {};
  var initialized = false;
  var queue = [];

  self.addEventListener("message",function(e){
    if(e.data.event !== "initialize") return;
    if(initialized) return;
    fetch(new Request("/HelpRequest/"+e.data.data._id+"/raw"))
    .then(function(response) {
      var reader = new Readable();
      var freader = response.body.getReader();
      reader.next = function(){
        freader.read().then(function(result) {
          reader.write(result.value);
          if(!result.done) return reader.next();
          reader.write(null);
        });
      };
      return reader;
    }).then(function(reader){
      reader.pipe(parse()).on("data",function(entry){
        entry.pipe(fs.createWriteStream(entry.path));
      });
      reader.next();
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
    fs.stat(data.path,function(e,stat){
      if(e) return sendError(data,e);
      if(stat.isDirectory()){
        fs.readdir(data.path,function(e,files){
          if(e) return sendError(data,e);
          self.postMessage({
            event:data.id,
            data: {
              type:"directory",
              contents: files
            }
          });
        });
      }else{
        fs.readFile(data.path,function(e,buff){
          if(e) return sendError(data,e);
          self.postMessage({
            event:data.id,
            data: {
              type:"directory",
              contents: buff.toArrayBuffer()
            }
          });
        });
      }
    });
  }

  function sendError(message,error){
    self.postMessage({
      event:message.id,
      error: error
    });
  }
};
