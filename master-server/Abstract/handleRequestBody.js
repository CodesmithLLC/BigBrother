var Busboy = require("busboy");
var fs = require("fs");
var mongoose = require("mongoose");

module.exports = function(req,instance,next){
  if(req.method.toUpperCase() === "GET") return next();
  var ret = {};
  var paths = instance.constructor.schema.paths;
  var busboy = new Busboy({ headers: req.headers });
  var piping = false;
  var queue = [];
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    if(!(fieldname in paths)) return;
    if(piping){
      return queue.push(arguments);
    }
    console.log("a file:",fieldname);
    handleFile(file,{
      _id: instance._id+"_"+fieldname, // a MongoDb ObjectId
      filename: filename, // a filename may want to change this to something different
      content_type: mimetype,
      root: instance.constructor.modelName,
    },function(e){
      if(e) return busboy.emit("error",e);
      instance[fieldname] = "gridfs://"+instance._id+"_"+fieldname;
      if(!queue.length) return;
      busboy.emit.apply(busboy,'file',queue.pop());
    });
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    if(!(fieldname in paths)) return;
    console.log("a feild:",fieldname);
    if(val === "" || val === null) return;
    instance[fieldname] = val;
  });
  busboy.on('finish', function() {
    console.log('Done parsing form!');
    next();
  });
  req.pipe(busboy).on('error',next);
};


function handleFile(file, gridfsOb, next) {
  file.on("data",function(data){
    console.log(data.toString("utf8"));
  });//
  file.pipe(mongoose.gfs.createWriteStream(gridfsOb))
  .on("error",next)
  .on("finish",function(){
    console.log("finished file: ",fieldname,filename);
    next();
  });
}
