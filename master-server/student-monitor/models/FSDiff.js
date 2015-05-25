var mongoose = require("mongoose");
var Test = require("./Test");
var Schema = mongoose.Schema;
var parseDiff = require("../../Abstract/parse-diff-stream");
var pt = require("stream").PassThrough;

var schema = new mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:"Student",required:true},
  test: {type:mongoose.Schema.Types.ObjectId, ref:"Test"},
  createdAt: {
    type:Number,
    default:Date.now,
    index:true
  },
  path: String,
  subject:String,
  fs_type: {type:String,enum:["add","save","rem"]},
  passedTests:Boolean,
  diffObj:require("./DiffObj"),
  raw_: String
});

schema.virtual('raw').set(function (stream) {
  var self = this;
  //the stream tends to not be capabale of piping to two sources...
  //hopefully will reduce backpressure
  this.queueState.pending();
  stream.pipe(new pt()).pipe(new parseDiff()).on("full",function(full){
    self.raw_ = "gridfs://"+self._id+"_raw_";
    self.diffObj = full;
  })
    .on("finish",this.queueState.done)
    .on("error",this.queueState.error);
  this.queueState.pending();
  stream.pipe(new pt()).pipe(mongoose.gfs.createWriteStream({
    _id: this._id+"_raw_", // a MongoDb ObjectId
    filename: stream.filename, // a filename may want to change this to something different
    content_type: stream.headers["content-type"],
    root: this.constructor.modelName,
  }))
    .on("finish",this.queueState.done)
    .on("error",this.queueState.error);
});

schema.statics.Permission = function(req,next){
  if(!req.user) return next(false);
  if(req.method === "GET"){
    return next(req.user.roles.indexOf("teachers_assistant") !== -1);
  }
  if(req.method === "POST"){
    return next(req.user.roles.indexOf("student") !== -1);
  }
  return next(false);
};

schema.statics.defaultCreate = function(req,next){
  mongoose.model("Student").findOne({user:req.user._id}).exec(function(err,doc){
    if(err) return next(err);
    if(!doc) return next(new Error("student doesn't exist"));
    console.log(doc);
    next(void 0, {student:doc._id});
  });
};


schema.pre('validate', function(next) {
  if (!this.isNew) return next();
  if(!this.test) return next(new Error("test is undefined"));
  if(!this.test.isNew){
    return next();
  }
  var subject = this.subject;
  var self = this;
  this.test.student = this.student;
  this.test.parent = this._id;
  this.test.subject = this.subject;
  this.test.save(function(err,test){
    console.log("test done saving");
    if(err) return next(err);
    self.test = test;
    self.passedTests = test.score === 1;
    console.log("done with fsdiff");
    next();
  });
});

var FSDiff = mongoose.model('FSDiff', schema);
module.exports = FSDiff;
