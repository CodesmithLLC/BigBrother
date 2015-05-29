var cluster = require('cluster');
var ee = require("events").EventEmitter;

module.exports = function(mongoose){
  mongoose.ee = new ee();
  mongoose.plugin(function(schema){
    schema.pre('save', function(next){
      this.wasNew = this.isNew;
      next();
    });
    schema.post('save', function(){
      console.log(this.constructor.modelName+":"+(this.wasNew?"create":"update"));
      mongoose.ee.emit(
        this.constructor.modelName+":"+(this.wasNew?"create":"update"),
        this
      );
    });
  });
};
