var sa = require("superagent");
var async = require("async");
var globals = require("./globals");

module.exports = function(config){
  var self = this;
  return new Promise(function(rej,res){
    async.parrallel([function(config,next){
      sa.get("/min").end(function(err,res){
        if(err) return next(err);
        self.min = res.response[0];
        next();
      });
    },function(config,next){
      sa.get("/classrooms").end(function(err,res){
        if(err) return next(err);
        res.response.forEach(function(classroom){
          self.classrooms[classroom] = new ClassRoom(classroom);
          self.classroomContain.append(self.classrooms[classroom].elem);
        });
        next();
      });
    }],config,function(){

    });
  });
};
