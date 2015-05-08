
var multiparty = require("multiparty");
var fs = require("fs");
var mongoose = require("mongoose");

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
      part.resume();
      if (!part.filename) return;
      console.log(part);
      ops++;
      handleFile(part,{
        _id: instance._id+"_"+part.fieldname, // a MongoDb ObjectId
        filename: part.filename, // a filename may want to change this to something different
        content_type: part.headers["content-type"],
        root: instance.constructor.modelName,
      },function(e){
        if(e) return console.error(e);
        instance[fieldname] = "gridfs://"+instance._id+"_"+fieldname;
        ops--;
        if (context.gfsOps === 0)
        {
            next();
        }
      });
  });
  form.on("field", function(name, value) {
    if(!(name in paths)) return;
    console.log("a feild:",name);
    if(value === "" || value === null) return;
    instance[name] = value;
  });
  form.on("close", function() {
    if (ops === 0)
    {
      console.log("Done parsing form");
      next();
    }
  });
  form.on("error",next);
  form.parse(req);
  req.on("error",next);
};


function handleFile(file, gridfsOb, next) {
  file.on("data",function(data){
    console.log(data.toString("utf8"));
  })
  .on("error",next)
  .pipe(mongoose.gfs.createWriteStream(gridfsOb))
  .on("close",function(){
    console.log("finished file: ",gridfsOb._id,gridfsOb.filename);
    next();
  });
}
