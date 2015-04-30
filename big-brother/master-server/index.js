var io = require('socket.io-client');
var sa = require('superagent');

var big_brother_url = "";

var authorized = false;
var io;

//The purpose for this is generally to make sure any calls have auth headers

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
  var req = MASTER_SERVER.post(big_brother_url+"/help-request")
  .field("subject",subject);
  req.part()
    .set('Content-Disposition', 'form-data; name="description"')
    .set('Content-Type', 'text/plain')
    .write(description);
  var snappart = req.part()
   .set('Content-Type', 'application/x-tar')
   .set('Content-Disposition', 'attachment; filename=".tar"');
  snapshot.pipe(snappart);

  req.end(next);
};


module.exports.sendCommit = function(subject,message,test,diff,next){
  var req = MASTER_SERVER.post(big_brother_url+"/commit")
  .field("subject",subject)
  .field("message",message);
  var testpart = req.part()
    .set('Content-Disposition', 'form-data; name="test"')
    .set('Content-Type', 'text/plain');
  test.pipe(testpart);
  var diffpart = req.part()
  .set('Content-Disposition', 'form-data; name="diff"')
  .set('Content-Type', 'text/plain');
  diff.pipe(diffpart);
  req.end(next);
};