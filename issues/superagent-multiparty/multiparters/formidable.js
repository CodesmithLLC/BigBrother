var formidable = require("formidable");


module.exports = function(isValid,req,res,next){
  var form = new formidable.IncomingForm();
  form.onPart = function(part) {
    if(!isValid(part)) return;
    if (!part.filename) return form.handlePart(part);
    part.on("data",function(data){
      console.log("data recieved");
    })
    .on("error",next)
    .on("end",function(){
      console.log("part close");
    });
  };
  form.on("field", function(name, value) {
    console.log(name,value);
  });
  form.on("end", function(name, value) {
    console.log("Done parsing form");
    res.status(200).end("ok");
  });
  form.on("error",function(e){
    console.error(e);
    form.resume();
  });
  req.on("error",next);
  form.parse(req);
};
