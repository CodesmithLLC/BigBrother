var _ = require("lodash");
var async = require("async");

module.exports = function(req,res,next){
  var ipp = false;
  if("ipp" in req.query){
    ipp = req.query.ipp;
    delete req.query.ipp;
  }
  var index = "createdOn";
  var sort = "createdOn";
  if("sort" in req.query){
    index = sort = req.query.sort;
    delete req.query.sort;
    if(/^\W/.test(index)) index = index.substring(1);
  }
  if("dir" in req.query){
    sort = (parseInt(req.query.dir) < 0?"-":"")+sort;
    delete req.query.dir;
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
  console.log(req.query);
  async.waterfall([
    function(next){
      if(req.mClass.defaultSearch){
        req.mClass.defaultSearch(req,next);
      }else{
        next(void(0),{});
      }
    },
    function(search,next){
      _.extend(search,req.query||{});
      console.log(search);
      var q = req.mClass.find(search).sort(sort);
      if(ipp !== false){
        q = q.limit(ipp);
      }
      if(populate !== false){
        q = q.populate(populate);
      }
      if(max !== false){
        q = q.where(index).lte(max);
      }
      if(min !== false){
        q = q.where(index).gte(min);
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
