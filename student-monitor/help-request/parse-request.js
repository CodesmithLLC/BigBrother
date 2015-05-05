var BusBoy = require("busboy");

module.exports = function(req,next){
  var busboy = new Busboy({ headers: req.headers });
  var desclist, finlist;
  busboy.on('field', desclist = function(fieldname, val, fieldnameTruncated, valTruncated) {
    if(fieldname !== "description") return;
    busboy.removeListener("finish",finlist);
    next(void(0),val);
  });
  busboy.on("finish", finlist = function(){
    next(new Error("expected a description"));
  });
};
