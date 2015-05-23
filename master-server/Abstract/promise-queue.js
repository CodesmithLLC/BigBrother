
/*

The following section is ugly and certainly not prefered
However, I'll try to walk you through this the best I can

1) We add a counter to the instance which will be deleted before saving
  -We expect each part to add to it whenever they succeed
  -We expect each part to subtract whenever they are done
  -Optionally, they can set it to an error (which counts as "throwing it")

2) When the counter === 0, we resolve the promise

*/

var P = require("bluebird");

module.exports = function(obj){
  var tasks = 0;
  var rejected = false;
  var resolved = false;
  return new P(function(rej,ful){
    obj.queueState = {
      pending:function(){
        tasks++;
      },
      error:function(e){
        console.error(arguments);
        if(resolved) return console.error("already resolved");
        if(rejected) return console.error("rejecting twice");
        rejected = true;
        rej(e);
      },
      done: function(){
        if(rejected) return console.log("already rejected");
        if(resolved) return console.error("resolve twice");
        tasks--;
        console.log(tasks);
        if(tasks === 0){
          resolved = true;
          delete obj.queueState;
          ful();
        }
      }
    };
  });
};
