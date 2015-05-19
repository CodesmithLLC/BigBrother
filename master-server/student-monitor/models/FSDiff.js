var mongoose = require("mongoose");
var Test = require("./Test");
var Schema = mongoose.Schema;
var parseDiff = require("../../Abstract/parse-diff-stream");
var pt = require("stream").PassThrough;

var schema = new mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref:"Student"},
  test: {type:mongoose.Schema.Types.ObjectId, ref:"Test"},
  createdAt: {
    type:Date,
    default:Date.now,
    index:true
  },
  path: String,
  subject:String,
  fs_type: {type:String,enum:["add","save","rem"]},
  passedTests:Boolean,
  diffObj:Object,
  raw_: String
});

schema.virtual('raw').set(function (stream) {
  console.log("have stream");
  var self = this;
  var t = stream.pipe(new pt());
  t.pipe(new parseDiff()).on("full",function(full){
    self.diffObj = full;
  });
  self.raw_ = "gridfs://"+self._id+"_raw_";
  t
  .pipe(mongoose.gfs.createWriteStream({
    _id: this._id+"_raw_", // a MongoDb ObjectId
    filename: stream.filename, // a filename may want to change this to something different
    content_type: stream.headers["content-type"],
    root: this.constructor.modelName,
  }))
  .on("finish",function(){
    console.log("finished file: ",self._id+"_raw_");
  })
  .on("error",function(e){
    console.error(e);
  });
  console.log("handled stream");
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
  mongoose.model("Student").find({user:req.user._id}).exec(function(err,doc){
    if(err) return next(err);
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
  this.test.user = this.user;
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
