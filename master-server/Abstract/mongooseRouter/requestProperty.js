var mongoose = require("mongoose");
var async = require("async");
var mpath = require("mpath");

module.exports = function(req,res,next){
  var paths = req.paths;
  var val = mpath.get(req.params.property,req.doc);
  var key = paths[req.params.property];
  if(key.instance === "objectid"){
    if(typeof val === "undefined"){
      return res.status(404).end();
    }
    if(!Array.isArray(val)){
      return mongoose.model(key.ref).findOne({_id:val},function(err,child){
        if(err) return next(err);
        if(!child) res.status(404).end();
        res.status(200).send(child.toObject());
      });
    }
    res.status(200).write("[");
    var l = val.length - 1;
    return async.eachSeries(val,function(id,next){
      mongoose.model(key.ref).findOne({_id:val},function(err,child){
        if(err) return next(err);
        res.write(JSON.stringify(child.toObject()));
        if(l--) res.write(",");
        next();
      },function(err){
        if(err) console.error(err);
        res.end("]");
      });
    });
  }
  if(path.instance !== "string"){
    return res.status(200).send(val);
  }
  if(!/^gridfs::\/\//.test(val)){
    return res.status(200).send(val);
  }
  var prop = {
    _id: val.substring(9),
    root: instance.constructor.modelName
  };
  mongoose.gfs.findOne(prop, function (err, file) {
    if(err) return next(err);
    if(!file) return res.status(404).end();
    res.status(200).set("Content-Type",file.content_type);
    mongoose.gfs.createReadStream(prop).on("error",next).pipe(res);
  });
};
