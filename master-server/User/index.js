var U = require("./UserModel");

module.exports = function(config,next){
  next(void 0,{
    middleware:require("./userMiddleware")(config.user),
    router:require("./router"),
  });
};
