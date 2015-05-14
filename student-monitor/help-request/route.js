
var snitcher = require("../snitcher");
var snapshot = require("./snapshot");
var parseReq = require("./parse-request");
var MASTER_SERVER = require("../master-server");

module.exports = function(req,res,next){
  parseReq(req,function(err,desc){
    if(err) return next(err);
    snapshot(snitcher.path,function(err,tar){
      if(err) return next(err);
      MASTER_SERVER.requestHelp(snitcher.subject,desc,tar,function(err,helpres){
        if(err) return next(err);
        res.status(200).end();
      });
    });
  });
};
