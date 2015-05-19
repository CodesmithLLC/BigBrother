
module.exports = function(self){
  self.addEventListener("message",function(e){
    var req = new XMLHttpRequest();
    req.open("GET", self.location.origin+"/hello", true);
    req.send();
    req.addEventListener("error",function(e){
      self.postMessage({
          event:"result",
          error:e.stack
        });
    });
    req.addEventListener("load",function(e){
      self.postMessage({
        event:"result",
        data:req.response
      });
    });
  });
};
