var io = require('socket.io-client');
var sa = require('superagent');

var big_brother_url = "";

var authtoke = void(0)
var io;

//The purpose for this is generally to make sure any calls have auth headers
module.exports.authorize = function(token){
  authtoke = token;
};


module.exports.initialize = function(){
  var EE = require("events").EventEmitter;
  io = new EE();
//	MASTER_SERVER = require('socket.io-client')(big_brother_url);

  var cl,el;
  io.once('connect', cl = function(){
    MASTER_SERVER.removeListener('error',el);
    next(void(0),io);
  });
  io.once('error', el = function(e){
    MASTER_SERVER.removeListener('error',cl);
    next(e);
  });
};

module.exports.requestHelp = function(subject,description,snapshot,next){
  var req = sa.post(big_brother_url+"/help-request")
    .field("subject",subject)
    .field("description",description);
  var snappart = req.part().type('application/x-tar')
    .set('Content-Disposition', 'attachment; name="raw"; filename="file.tar"');
  snapshot.pipe(snappart);

  req.end(next);
};

module.exports.sendCommit = function(commit){
  var req = MASTER_SERVER
    .post(big_brother_url+"/Commit")
    .field("subject",commit.subject)
    .field("commitMessage",commit.message);
  var testpart = req.part().type('text/plain')
    .set('Content-Disposition', 'form-data; name="test"');
  test.pipe(fsdiff.test);
  var diffpart = req.part().type('text/plain')
    .set('Content-Disposition', 'form-data; name="raw"');
  diff.pipe(fsdiff.diff);
  req.end(function(err,res){
    if(err) throw err;
  });
};

module.exports.sendFSDiff = function(fsdiff){
  var req = MASTER_SERVER
    .post(big_brother_url+"/FSDiff")
    .field("subject",fsdiff.subject)
    .field("path",fsdiff.path)
    .field("fs_type",fsdiff.type);
  var testpart = req.part().type("text/plain")
    .set('Content-Disposition', 'form-data; name="test"');
  test.pipe(fsdiff.test);
  var diffpart = req.part().type("text/plain")
    .set('Content-Disposition', 'form-data; name="raw"');
  diff.pipe(fsdiff.diff);
  req.end(function(err,res){
    if(err) throw err;
  });
};
