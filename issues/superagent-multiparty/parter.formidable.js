var formidable = require("formidable");


module.exports = function(isValid,req,res,next){
  var form = new formidable.IncomingForm();
  form.onPart = function(part) {
    if (!part.filename) return form.handlePart(part);
    if(!isValid(part,part.name,part.filename)) return;
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
  form.on("error",next);
  req.on("error",next);
  form.parse(req);
};
