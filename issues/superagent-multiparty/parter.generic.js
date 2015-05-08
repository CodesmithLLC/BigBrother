var multiparty = require("multiparty");

module.exports = function(isValid,req,res,next){
  isValid(req);
  req.on("data",function(data){
    console.log("data recieved");
  });
  req.on("error",next);
  req.on("end",function(){
    res.status(200).end("ok");
  });
};
