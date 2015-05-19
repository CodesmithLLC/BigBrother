var _ = require("lodash");
var async = require("async");

module.exports = function(req,res,next){
  var ipp = 10;
  if("ipp" in req.query){
    ipp = req.query.ipp;
    delete req.query.ipp;
  }
  var sort = "-createdOn";
  if("sort" in req.query){
    sort = req.query.sort;
    delete req.query.sort;
  }
  var max = false;
  if("max" in req.query){
    max = req.query.max;
    delete req.query.max;
  }
  var min = false;
  if("min" in req.query){
    min = req.query.min;
    delete req.query.min;
  }
  var populate = false;
  if("populate" in req.query){
    populate = req.query.populate;
    delete req.query.populate;
  }
  var select = false;
  if("select" in req.query){
    select = req.query.select;
    delete req.query.select;
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
      if(max !== false){
        q = q.where(sort).lte(max);
      }
      if(min !== false){
        q = q.where(sort).gte(min);
      }
      if(select !== false){
        q = q.select(select);
      }
      q.exec(next);
    }
  ],function(err,docs){
    if(err) return next(err);
    //May want to implement stream
    //http://mongoosejs.com/docs/api.html#querystream_QueryStream
    res.send(docs);
  });
};
