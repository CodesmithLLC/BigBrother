
var fs = require("fs");
var template = fs.readFileSync(__dirname+"/template.html","utf8");
var Mustache = require("mustache");
var pvp = require("./pageVisiblePolyfill");
var jQuery = require("jquery");

function FlashMessager(contain,inst_template){
  if(!contain) throw Error("need contain");
  contain = jQuery(contain);
  if(contain.size() === 0) throw Error("need contain");
  var cur = {};
  contain.on("click", "> *",function(){
    var el = jQuery(this);
    el.remove();
    delete cur[el.find(".title").text()];
  });
  inst_template = inst_template || template;
  Mustache.parse(inst_template);
  return function(title,body){
    if(cur[title]){
      var c = cur[title].find(".count");
      c.text(parseInt(c.text())+1);
      return;
    }
    if(document[pvp.hidden]){
      new Notification(title, {body:body});
    }
    var msg = Mustache.render(inst_template,{title:title,body:body});
    console.log(msg);
    contain.append(cur[title] = jQuery(msg));
  };
}

module.exports = FlashMessager;
