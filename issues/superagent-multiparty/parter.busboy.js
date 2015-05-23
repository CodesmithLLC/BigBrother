var Busboy = require("busboy");


module.exports = function(isValid,req,res,next){
  var ret = {};
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    if(!isValid(file,fieldname,filename)) return;
    file.resume();
    file.on("data",function(data){
      console.log("data recieved");
    })
    .on("error",next)
    .on("end",function(){
      console.log("finished file: ",fieldname,filename);
      next();
    });
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    console.log(fieldname, val);
  });
  busboy.on('finish', function() {
    console.log("Done parsing form");
    res.status(200).end("ok");
  });
  busboy.on('error',next);
  req.on('error',next);
  req.pipe(busboy);
};
