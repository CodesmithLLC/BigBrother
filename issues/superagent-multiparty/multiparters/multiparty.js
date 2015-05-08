var multiparty = require("multiparty");

module.exports = function(isValid,req,res,next){
  var form = new multiparty.Form({maxFields:10, autoFiles:false});
  form.on("part", function(part){
    console.log("part: ",part.name);
    if(!isValid(part)) return;
    part.resume();
    if (!part.filename) return;
    part.on("data",function(data){
      console.log("data recieved");
    })
    .on("error",next)
    .on("end",function(){
      console.log("part close");
    });
  });
  form.on("field", function(name, value) {
    console.log(name,value);
  });
  form.on("close", function(){
    console.log("Done parsing form");
    res.status(200).end("ok");
  });
  form.on("error",next);
  req.on("error",next);
  form.parse(req);
};
