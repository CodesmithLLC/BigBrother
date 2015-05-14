
var pvp = require("./pageVisiblePolyfill");
this.template = template || this.generateTemplate();

function FlashMessager(contain,template){
  if(!contain) throw Error("need contain");
  this.contain = contain;
  this.template = template || this.generateTemplate();

}
//https://developer.mozilla.org/en-US/docs/Web/API/notification
FlashMessager.prototype.flash = function(type,title,msg){
  if(document[pvp.hidden]){
    new Notification(title, {body:msg});
  }
  this.contain.append(template(type,title,msg));
};
