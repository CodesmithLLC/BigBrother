
var cachedRegex = {};
var divTransform = document.createElement("div");

module.exports = function(template,obj){
  var keys = Object.keys(obj);
  keys.forEach(function(key){
    if(!(key in cachedRegex)){
      cachedRegex[key] = new RegExp("\\{\\{"+key+"\\}\\}");
    }
    template = template.replace(cachedRegex[key],obj[key]);
  });
  divTransform.innerHTML = template;
  return divTransfromt.children;
};
