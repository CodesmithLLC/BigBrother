
var multiparty = require("multiparty");
var fs = require("fs");
var mongoose = require("mongoose");
var oboe = require("oboe");

module.exports = function(req,instance,next){
  if(req.method.toUpperCase() === "GET") return next();
  var ret = {};
  var paths = instance.constructor.schema.paths;
  var form = new multiparty.Form({maxFieldSize:8192, maxFields:10, autoFiles:false});
  var piping = false;
  var queue = [];
  var ops = 0;
  form.on("part", function(part) {
      if(!(part.name in paths)) return;
      console.log(paths[part.name]);
      part.resume();
      if (!part.filename) return;
      if(paths[part.name].instance.toLowerCase() === "objectid"){
        var model = mongoose.model(paths[part.name].options.ref);

        if(!model){
          return;
        }
        ops++;
        part.resume();
        part.on("error",function(){});
        return oboe(part).done(function(obj){
          ops--;
          instance[part.name] = obj;
          if (ops === 0)
          {
              next();
          }
        }).fail(req.emit.bind(req,"error"));
      }
      ops++;
      handleFile(part,{
        _id: instance._id+"_"+part.name, // a MongoDb ObjectId
        filename: part.filename, // a filename may want to change this to something different
        content_type: part.headers["content-type"],
        root: instance.constructor.modelName,
      },function(e,value){
        if(e) return req.emit("error",e);
        instance[part.name] = "gridfs://"+instance._id+"_"+part.name;
        ops--;
        if (ops === 0)
        {
            next();
        }
      });
  });
  form.on("field", function(name, value) {
    if(!(name in paths)) return;
    if(value === "" || value === null) return;
    instance[name] = value;
  });
  form.on("close", function() {
    if (ops === 0)
    {
      console.log("Done parsing form");
    }
  });
  form.on("error",next);
  form.parse(req);
};


function handleFile(file, gridfsOb, next) {
  file.on("error",next)
  .pipe(mongoose.gfs.createWriteStream(gridfsOb))
  .on("close",function(){
    console.log("finished file: ",gridfsOb._id,gridfsOb.filename);
    next();
  });
}
