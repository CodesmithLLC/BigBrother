var cachedRegex = {};
var divTransform = document.createElement("div");

module.exports.appendCSS = function(css){
  var head = document.head || document.getElementsByTagName('head')[0],
  style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.insertBefore(style, head.firstChild);
};

module.exports.renderTemplate = function(template,obj){
  var keys = Object.keys(obj);
  keys.forEach(function(key){
    if(!(key in cachedRegex)){
      cachedRegex[key] = new RegExp("\\{\\{"+key+"\\}\\}");
    }
    template = template.replace(cachedRegex[key],obj[key]);
  });
  divTransform.innerHTML = template;
  return divTransform.children;
};
