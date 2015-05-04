var Busboy = require("busboy");
var fs = require("fs");
var mongoose = require("mongoose");

module.exports = function(req,instance,next){
  if(req.method.toUpperCase() === "GET") return next();
  var ret = {};
  var paths = instance.constructor.schema.paths;
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    if(!(fieldname in paths)) return;
    console.log(paths[fieldname]);
    file.pipe(gfs.createWriteStream({
      _id: instance._id+"/"+fieldname, // a MongoDb ObjectId
      filename: filename, // a filename
      content_type: mimetype,
      root: instance.constructor.modelName,
    }));
    instance[fieldname] = "gridfs://"+instance._id+"/"+fieldname;
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    if(!(fieldname in path)) return;
    if(val === "" || val === null) return;
    instance[fieldname] = val;
  });
  busboy.on('finish', function() {
    console.log('Done parsing form!');
    next();
  });
  busboy.on('error',next);
  req.pipe(busboy);
};
