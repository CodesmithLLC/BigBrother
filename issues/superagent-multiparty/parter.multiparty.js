var multiparty = require("multiparty");

module.exports = function(isValid,req,res,next){
  var form = new multiparty.Form({maxFields:50, autoFiles:false});
  form.on("part", function(part){
    console.log("part: ",part.name);
    part.on("error",next);
    part.resume();
    if (!part.filename) return;
    if(!isValid(part,part.name,part.filename)) return;
    part.on("data",function(data){
      console.log("data recieved");
    })
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
  form.on("error",function(){});
  form.parse(req);
};
