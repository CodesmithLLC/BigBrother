
var multiparty = require("multiparty");
var fs = require("fs");
var mongoose = require("mongoose");
var promiseQueue = require("../promise-queue.js");
var mpath = require("mpath");

var noEdit = /_$/;
var isHidden = /^_/;


module.exports = function(req,instance,next){
  var paths = instance.constructor.schema.paths;
  var virtuals = instance.constructor.schema.virtuals;
  var form = new multiparty.Form({maxFieldSize:8192, maxFields:10, autoFiles:false});
  promiseQueue(instance,function(e){
    if(e){
      form.end();
      req.pause();
      console.error("error: ",e);
      return setImmediate(next.bind(next,e));
    }
    setImmediate(next);
  });

  instance.queueState.pending();
  form.on("part", function(part) {
    console.log(part.name);
    if(isHidden.test(part.name)) return part.resume();
    if(noEdit.test(part.name)) return part.resume();
    if(part.name in virtuals){
      if (!part.filename) return part.resume();
      instance.queueState.pending();
      mpath.set(part.name,part,instance);
      part
        .on("error",instance.queueState.error)
        .on("end",instance.queueState.done);
      return;
    }
    if(!(part.name in paths)) return part.resume();
    if (!part.filename) return part.resume();
    if(paths[part.name].instance.toLowerCase() === "objectid"){
      var Model = mongoose.model(paths[part.name].options.ref);
      if(!Model) return instance.queueState.error(new Error("Model does not exist"));
      handleObject(Model,part,instance);
      return;
    }
    handleFile(part,instance);
  });
  form.on("field", function(name, value) {
    if(!(name in virtuals) && !(name in paths)) return;
    if(value === "" || value === null) return;
    mpath.set(name,value,instance);
  });
  form.on("close", function() {
    instance.queueState.done();
    console.log("Done parsing form");
  });
  form.on("error",instance.queueState.error);
  form.parse(req);
};


function handleFile(part, instance) {
  instance.queueState.pending();
  part
  .pipe(mongoose.gfs.createWriteStream({
    _id: instance._id+"_"+part.name, // a MongoDb ObjectId
    filename: part.filename, // a filename may want to change this to something different
    content_type: part.headers["content-type"],
    root: instance.constructor.modelName,
  }))
  .on("finish",function(){
    console.log("finished file: ",instance._id+"_"+part.name,part.filename);
    mpath.set(part.name,"gridfs://"+instance._id+"_"+part.name,instance);
    instance.queueState.done();
  })
  .on("error",instance.queueState.error);
}

function handleObject(Model,part,instance){
  instance.queueState.pending();

  //This is a bad function that has possible openings for an attack
  var buffer = "";
  part.on("data",function(data){
    buffer += data.toString("utf8");
  }).on("end",function(){
    try{
      mpath.set(part.name,new Model(JSON.parse(buffer)),instance);
      instance.queueState.done();
    }catch(e){
      console.error("error: ",buffer);
      instance.queueState.error(e);
    }
  }).on("error",instance.queueState.error);
  part.resume();
}
