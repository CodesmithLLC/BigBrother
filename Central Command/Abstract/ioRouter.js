var EE = require("events").EventEmitter;

function ioGetter(ws){
  ws.get = function(){
    var id = Math.random()+"_"+Date.now();
    this.once(id, function(message){
      next(message);
    });
    this.send({event:event,method:"GET",data:data});
  };
  ws.on("message",function(msg){
    if(msg.method === "RETURN"){
      return this.emit(msg.event,msg.data);
    }else if(msg.method === "GET"){
      if(this.listeners(msg.event).length === 0){
        this.ws.send({
          event:msg.id,
          error:404
        });
      }else{
        this.emit(msg.event,msg,function(err,data){
          this.ws.send({
            event:msg.id,
            method:"RETURN",
            err:err,
            data:data
          });
        });
      }
    }
  });
}

module.exports = ioGetter;
