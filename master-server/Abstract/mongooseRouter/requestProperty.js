var mongoose = require("mongoose");
var async = require("async");

module.exports = function(req,res,next){
  var paths = req.paths;
  if(paths[req.params.property].instance === "objectid"){
    if(!req.doc[req.params.property]){
      return res.status(200).send(req.doc[req.params.property]);
    }
    if(!Array.isArray(req.doc[req.params.property])){
      return req.doc[req.params.property].populate(function(err,child){
        if(err) return next(err);
        if(!child) res.status(404).end();
        res.status(200).send(child);
      });
    }
    res.status(200).write("[");
    var l = req.doc[req.params.property].length - 1;
    return async.eachSeries(req.doc[req.params.property],function(id,next){
      id.populate(function(err,child){
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
  if(paths[req.params.property].instance !== "string"){
    return res.status(200).send(req.doc[req.params.property]);
  }
  if(!/^gridfs::\/\//.test(req.doc[req.params.property])){
    return res.status(200).send(req.doc[req.params.property]);
  }
  var prop = {
    _id: req.doc[req.params.property].substring(9),
    root: instance.constructor.modelName
  };
  mongoose.gfs.findOne(prop, function (err, file) {
    if(err) return next(err);
    if(!file) return res.status(404).end();
    res.status(200).set("Content-Type",file["content-type"]);
    mongoose.gfs.createReadStream(prop).on("error",next).pipe(res);
  });
};
