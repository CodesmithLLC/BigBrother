
var multiparty = require("multiparty");
var fs = require("fs");
var mongoose = require("mongoose");

var noEdit = /_$/;
var isHidden = /^_/;


module.exports = function(req,instance,next){
  if(req.method.toUpperCase() === "GET") return next();
  var paths = instance.constructor.schema.paths;
  var virtuals = instance.constructor.schema.virtuals;
  var form = new multiparty.Form({maxFieldSize:8192, maxFields:10, autoFiles:false});
  var ended = false;

  function destroy(e){
    if(ended) return;
    ended = true;
    form.end();
    req.pause();
    next(e);
  }

  form.on("part", function(part) {
    if(isHidden.test(part.name)) return;
    if(noEdit.test(part.name)) return;
    if(part.name in virtuals){
      part.resume();
      if (!part.filename) return;
      instance[part.name] = part;
      part.on("error",destroy);
      return;
    }
    if(!(part.name in paths)){
      if(instance.setItem){
        instance.setItem(part);
        part.on("error",destroy);
      }
      return;
    }
    part.resume();
    if (!part.filename) return;
    if(paths[part.name].instance.toLowerCase() === "objectid"){
      var Model = mongoose.model(paths[part.name].options.ref);
      if(!Model) return destroy(new Error("Model does not exist"));
      return handleObject(part,function(err,obj){
        if(err) return destroy(err);
        instance[part.name] = new Model(obj);
      });
    }
    handleFile(part,{
      _id: instance._id+"_"+part.name, // a MongoDb ObjectId
      filename: part.filename, // a filename may want to change this to something different
      content_type: part.headers["content-type"],
      root: instance.constructor.modelName,
    },function(e,value){
      if(e) return destroy(e);
      instance[part.name] = "gridfs://"+instance._id+"_"+part.name;
    });
  });
  form.on("field", function(name, value) {
    if(!(name in virtuals) && !(name in paths)) return;
    if(value === "" || value === null) return;
    instance[name] = value;
  });
  form.on("close", function() {
    console.log("Done parsing form");
    setImmediate(next);
  });
  form.on("error",destroy);
  form.parse(req);
};


function handleFile(file, gridfsOb, next) {
  file
  .pipe(mongoose.gfs.createWriteStream(gridfsOb))
  .on("close",function(){
    console.log("finished file: ",gridfsOb._id,gridfsOb.filename);
    next();
  })
  .on("error",next);
}

function handleObject(file,next){
  var buffer = "";
  file.on("data",function(data){
    buffer += data.toString("utf8");
  }).on("end",function(){
    try{
      next(void(0),JSON.parse(buffer));
    }catch(e){
      next(e);
    }
  }).on("error",next);
}
