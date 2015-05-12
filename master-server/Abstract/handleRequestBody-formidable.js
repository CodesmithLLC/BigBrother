
var formidable = require("formidable");
var fs = require("fs");
var mongoose = require("mongoose");

module.exports = function(req,instance,next){
  if(req.method.toUpperCase() === "GET") return next();
  var paths = instance.constructor.schema.paths;
  var form = new formidable.IncomingForm();

  var ended = false;
  function destroy(e){
    if(ended) return;
    ended = true;
    console.error("error: ",e);
    form.pause();
    form.onPart = function () {};
    next(e);
  }

  form.onPart = function(part) {
    if(!(part.name in paths)) return;
    if (!part.filename) return form.handlePart(part);
    if(paths[part.name].instance.toLowerCase() === "objectid"){
      var Model = mongoose.model(paths[part.name].options.ref);
      if(!Model) return destroy(new Error("Model does not exist"));
      console.log("before json",form._flushing);
      form._flushing++;
      return handleObject(part,function(err,obj){
        if(err) return destroy(err);
        instance[part.name] = new Model(obj);
        form._flushing--;
        console.log("json",form._flushing);
        form._maybeEnd();
      });
    }else{
      console.log("before file",form._flushing);
      form._flushing++;
      handleFile(part,{
        _id: instance._id+"_"+part.name, // a MongoDb ObjectId
        filename: part.filename, // a filename may want to change this to something different
        content_type: part.headers["content-type"],
        root: instance.constructor.modelName,
      },function(e,value){
        if(e) return destroy(e);
        instance[part.name] = "gridfs://"+instance._id+"_"+part.name;
        console.log("test", Object.keys(instance));
        form._flushing--;
        console.log("file",form._flushing);
        form._maybeEnd();
      });
    }
  };
  form.on("field", function(name, value) {
    instance[name] = value;
  });
  form.on("end", function(name, value) {
    console.log("Done parsing form");
    console.log("test", Object.keys(instance));
    next();
  });
  form.on("error",next);
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
