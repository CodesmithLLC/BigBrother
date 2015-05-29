

module.exports = function connectDatabase(obj,config,next){
  obj.http.use(require("../../apps/portals/router"));
  next();
};
