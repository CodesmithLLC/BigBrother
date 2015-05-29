var EE = require("events").EventEmitter;

var ret = new EE();
process.on('message', function(msg) {
  if(!msg.event) return;
  ret._emit.apply(ret,[msg.event].concat(msg.args));
});

ret._emit = ret.emit;
ret.emit = function(event){
  var args = [];
  for(var i=1,l=arguments.length;i<l;i++) args[i] = arguments[i];
  process.send({
    event:event,
    args:args
  });
};

module.exports = ret;
