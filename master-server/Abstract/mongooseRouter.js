var mongoose = require("mongoose");
var router = require("express").Router();
var url = require("url");
var _ = require("lodash");
var bodyHandler = require("./handleRequestBody-formidable");
var async = require("async");

var isHidden = /^_.*/;
var permit, requestOne, requestMany, requestOneProperty,
  createOne, updateOne, deleteOne;

router.param('classname', function(req, res, next, classname){
  if(isHidden.test(classname)) return res.status(404).end();
  if(mongoose.modelNames().indexOf(classname) === -1) return res.status(404).end();
  req.mClass = mongoose.model(classname);
  next();
});

router.param("property", function(req,res,next,property){
  if(isHidden.test(property)) return res.status(404).end();
  if(property in req.mClass.schema.paths){
    req.paths = req.mClass.schema.paths;
    return next();
  }
  //We may be searching with this model
  var maybe;
  try{
    maybe = mongoose.model(property);
  }catch(e){
    console.error("non-existant Model");
    return res.status(404).end();
  }
  var paths = maybe.schema.paths;
  var ex = {};
  if(!Object.keys(paths).some(function(key){
    if(paths[key].instance !== "ObjectID") return false;
    if(paths[key].options.ref !== req.mClass.modelName) return false;
    ex[key] = req.doc._id;
    return true;
    //Looking for a way to search
  })){
    console.error("no path to search for");
    return res.status(404).end();
  }
  _.extend(req.query, ex);
  req.mClass = maybe;
  permit(req,res,function(){
    requestMany(req,res,next);
  });
});

router.param("id", function(req,res,next,id){
  req.mClass.findOne({_id:req.params.id}, function(err, doc){
    if(err) return next(err);
    if(!doc) return res.status(404).end();
    req.doc = doc;
    next();
  });
});

router.param('method', function(req, res, next, method){
  if(isHidden.test(method)) return res.status(404).end();
  if(req.doc && !req.doc[method]) return res.status(404).end();
  if(!req.doc && !req.mClass[method]) return res.status(404).end();
  next();
});

router.use(function(req,res,next){
  console.log("before mongoose");
  next();
});
router.use(["/:classname","/:classname/*"],permit=function(req,res,next){
  console.log("permitting");
  if(!req.mClass.Permission) return next();
  req.mClass.Permission(req,function(boo){
    console.log("permission: ",boo);
    if(!boo) return res.status(403).end();
    next();
  });
});
router.post("/:classname",createOne=function(req,res,next){
  var doc;
  async.waterfall([
    function(next){
      if(req.mClass.defaultCreate){
        req.mClass.defaultCreate(req,next);
      }else{
        next(void(0),{});
      }
    },
    function(create,next){
      doc = new req.mClass(create);
      bodyHandler(req,doc,function(e){
        if(e) return next(e);
        doc.save(next);
      });
    }
  ],function(err){
    if(err) return next(err);
    res.status(200).send(doc.toObject());
  });
});
router.get("/:classname",requestMany=function(req,res,next){
  var ipp = 10;
  if(req.query.ipp){
    ipp = req.query.ipp;
    delete req.query.ipp;
  }
  var sort = "-createdOn";
  if(req.query.sort){
    sort = req.query.sort;
    delete req.query.sort;
  }
  var populate = false;
  if(req.query.populate){
    populate = req.query.populate;
    delete req.query.populate;
  }
  async.waterfall([
    function(next){
      if(req.mClass.defaultSearch){
        req.mClass.defaultSearch(req,next);
      }else{
        next(void(0),{});
      }
    },
    function(search,next){
      _.extend(req.query||{},search);
      var q = req.mClass.find(search).limit(ipp).sort(sort);
      if(populate !== false){
        q = q.populate(populate);
      }
      q.exec(next);
    }
  ],function(err,docs){
    if(err) return next(err);
    res.status(200).send(docs);
  });
});
router.get("/:classname/:id",requestOne=function(req,res,next){
  res.status(200).send(req.doc.toObject());
});
router.get("/:classname/:id/:property",requestOneProperty=function(req,res,next){
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
});

router.delete("/:classname/:id",deleteOne=function(req,res){
  req.doc.remove(function(err,doc){
    if(err) return next(err);
    if(!doc) return res.status(404).end();
    res.status(200).send(doc.toObject());
  });
});
router.put("/:classname/:id",updateOne=function(req,res,next){
  bodyHandler(req,req.doc,function(e){
    if(e) return next(e);
    req.doc.save(function(e){
      if(e) return next(e);
      res.status(200).send(doc.toObject());
    });
  });
});


router.post("/:classname/:method",function(req,res){
  req.mClass[req.params.method](req.body,function(err,ret){
    if(err) return next(new Error(err));
    if(!ret) return res.status(404).end();
    if( ret instanceof mongoose.Document ||
        ret instanceof mongoose.DocumentArray){
      ret = ret.toObject();
    }
    res.status(200).send(ret);
  });
});

router.post("/:classname/:id/:method",function(req,res){
  req.doc[req.params.method](req.body,function(err,doc){
    if(err) return next(new Error(err));
    if(!ret) return res.status(404).end();
    if( ret instanceof mongoose.Document ||
        ret instanceof mongoose.DocumentArray){
      ret = ret.toObject();
    }
    res.status(200).send(ret);
  });
});

module.exports = router;
