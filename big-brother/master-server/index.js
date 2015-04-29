var io = require('socket.io-client');
var sa = require('superagent');

var big_brother_url = "";


module.exports = {
  io:io(big_brother_url),
  sa:sa
};


module.exports.requestHelp = function(snapshot){
  sa.post(big_brother_url+"/help-request")
  .field("subject",snapshot.subject)
  .
 req.part()
   .set('Content-Type', 'application/x-tar')
   .set('Content-Disposition', 'attachment; filename=".tar"')
   .write('some image data')
   .write('some more image data');
}
