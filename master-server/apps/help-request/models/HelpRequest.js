var mongoose = require("mongoose");
var tar = require("tar-stream");
var mimetypes = require("mime-types");
var pu = require("path");
var pot = require("../../../Abstract/path-object-traversal");
var Interaction = require("./Interaction");
var async = require("async");
var TA = require("../../portals/models/ta");

var schema = new mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:"Student", index:true},
  ta: {type: mongoose.Schema.Types.ObjectId, ref:"TeachersAssistant", index:true},
  classroom:{type:String,required:true,index:true},
  createdAt: {
    type:Number,
    default:Date.now,
    index:true
  },
  subject:{type:String,required:true},
  description:String,
  state:{
    type:String,
    enum:["waiting","taken","solved","canceled","timeout"],
    default:"waiting",
    index:true
  },
  escalation:{type:String, default:"local"},
  snapshot: require("./SnapShot")
});

schema.statics.findTAsCurrent = function(ta,next){
  this.findOne({ta:ta._id,state:"taken"}).populate("student").exec(next);
};

schema.statics.take = function(help_id,ta,next){
  this.findById(help_id,function(e,hr){
    if(e) return next(e);
    if(!hr) return next(new Error("Help Request doesn't exist"));
    hr.take(ta,next);
  });
};
schema.statics.ignore = function(help_id,level,next){
  this.findById(help_id,function(e,hr){
    if(e) return next(e);
    if(!hr) return next(new Error("Help Request doesn't exist"));
    hr.ignore(level,next);
  });
};

schema.statics.fail = function(student,next){
  this.findOne({student:student._id,state:"taken"},function(e,hr){
    if(e) return next(e);
    if(!hr) return next(new Error("Help Request doesn't exist"));
    hr.fail(next);
  });
};

schema.statics.solve = function(student,next){
  this.findOne({student:student._id,state:"taken"},function(e,hr){
    if(e) return next(e);
    if(!hr) return next(new Error("Help Request doesn't exist"));
    hr.solve(next);
  });
};

schema.statics.cancel = function(student,next){
  this.findOne({student:student._id,state:"waiting"},function(e,hr){
    if(e) return next(e);
    if(!hr) return next(new Error("Help Request doesn't exist"));
    hr.cancel(next);
  });
};

schema.methods.ignore = function(level,next){
  var HR = this.constructor;
  var self = this;
  async.map([function(next){
    Interaction.find({helpRequest:this._id}).select("ta").exec(function(e,list){
      if(e) return next(e);
      list = list.map(function(item){
        return item.ta;
      });
      next(void 0, list);
    });
  }, function(next){
    var tofind = {state:"taken"};
    if(level === "local"){
      tofind.classroom = self.classroom;
    }
    HR.find(tofind).select("ta").exec(function(e,list){
      if(e) return next(e);
      list = list.map(function(item){
        return item.ta;
      });
      next(void 0, list);
    });
  }],function(e,res){
    if(e) return next(e);
    var tofind = {_id:{$not:{$in:res[0].concat(res[1])}}};
    if(level === "local"){
      tofind.classroom = self.classroom;
    }
    TA.find(tofind).exec(function(e,list){
      if(e) return next(e);
      async.each(list,function(item,next){
        var interaction = new Interaction({
          student: self.student,
          ta:item,
          interactionType: "ignore",
          subject:self.subject,
          helpRequest:self._id
        });
        interaction.save(next);
      },next);
    });
  });
};

schema.methods.take = function(ta,next){
  if(this.state !== "waiting"){
    if(this.ta === ta._id) return next(void 0, this);
    return next(new Error("Already Taken"));
  }
  console.log(ta);
  var self = this;
  this.constructor.findOne({ta:ta._id,state:"taken"},function(e,hr){
    if(e) return next(e);
    if(hr) return next(new Error("Already have a help request"));
    self.ta = ta;
    self.state = "taken";
    self.save(function(e){
      if(e) return next(e);
      next(void 0, self);
    });
  });
};

schema.methods.cancel = function(next){
  if(this.state !== "waiting"){
    return setImmediate(next.bind(next,new Error("Cannot cancel a help request that is not waiting")));
  }
  this.state = "canceled";
  this.save(next);
};

schema.methods.fail = function(next){
  if(this.state !== "taken"){
    return setImmediate(next.bind(next,new Error("Cannot fail an untaken help request")));
  }
  var interaction = new Interaction({
    student: this.student,
    ta:this.ta,
    interactionType: "failure",
    subject:this.subject,
    helpRequest:this._id
  });
  this.state = "waiting";
  this.ta = null;
  async.series([
    this.save.bind(this),
    interaction.save.bind(interaction)
  ],next);
};


schema.methods.solve = function(next){
  if(this.state !== "taken"){
    return setImmediate(next.bind(next,new Error("Cannot solve an untaken help request")));
  }
  this.state = "solved";
  var interaction = new Interaction({
    student: this.student,
    ta:this.ta,
    interactionType: "success",
    subject:this.subject,
    helpRequest:this._id
  });
  async.series([
    this.save.bind(this),
    interaction.save.bind(interaction)
  ],next);
};


schema.statics.Permission = function(req,next){
  if(!req.user) return next(false);
  if(req.method === "GET"){
    return next(req.user.roles.indexOf("teachers_assistant") !== -1);
  }
  if(req.method === "POST"){
    console.log("here",req.user.roles.indexOf("student") !== -1);

    return next(req.user.roles.indexOf("student") !== -1);
  }
  return next(false);
};

schema.statics.defaultCreate = function(req,next){
  mongoose.model("Student").findOne({user:req.user},function(err,stud){
    if(err) return next(err);
    if(!stud) return next(new Error("this student does not exist"));
    return next(void 0, {student:stud,classroom:stud.classroom});
  });
};

schema.statics.defaultSearch = function(req,next){
  mongoose.model("TeachersAssistant").findOne({user:req.user},function(err,ta){
    if(err) return next(err);
    if(!ta) return next (new Error("no ta"));
    next(void(0),{$or:[
      {classroom:ta.classroom,escalation:"local"},
      {escalation:"global"}
      ], state:"waiting"
    });
  });
};

schema.virtual('raw').set(function (stream) {
  console.log("have stream",stream);
  var i = 0;
  var system = {};
  var files = [];
  var self = this;
  this.queueState.pending();
  stream.pipe(mongoose.gfs.createWriteStream({
    _id: this._id+"_snapshot.raw", // a MongoDb ObjectId
    filename: stream.filename, // a filename may want to change this to something different
    content_type: stream.headers["content-type"],
    root: this.constructor.modelName,
  }))
    .on("error",this.queueState.error)
    .on("finish",this.queueState.done);
  this.queueState.pending();
  stream.pipe(tar.extract())
  //We want the error to be thrown
  .on('entry', function(header, stream, callback) {
    if(header.type === "directory"){
      return callback(); //We don't care about dirs
    }
    var bn = pu.basename(header.name);
    var metaData = {
      path:header.name,
      mimeType: mimetypes.lookup(bn) || 'application/octet-stream',
      size: header.size,
      parent: self.constructor.modelName+"/"+self._id,
      propName: +"snapshot.files."+i,
      _id:self._id+"_snapshot.files."+i,
      index: i,
      filename: bn
    };
    pot.set(system,header.name,metaData);
    files.push("gridfs://"+metaData._id);
    stream.pipe(mongoose.gfs.createWriteStream({
      _id: self._id+"_snapshot.files."+i, // a MongoDb ObjectId
      filename: bn,
      content_type: metaData.mimeType,
      root: self.constructor.modelName,
      metaData: metaData
    })).on("finish",callback);
    i++;
  }).on("finish",function(){
    self.snapshot = {
      raw: "gridfs://"+self._id+"_snapshot.raw",
      filesystem: system,
      files: files
    };
    self.queueState.done();
  }).on("error",this.queueState.error);
});

var HelpRequest = mongoose.model('HelpRequest', schema);
module.exports = HelpRequest;
