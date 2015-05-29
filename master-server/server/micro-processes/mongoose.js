

module.exports = function connectDatabase(obj,config,next){
  obj.http.use(require("../../Abstract/mongooseRouter"));
  next();
};
