
var jQuery = require("jquery");

function Pages(menu,pages){
  jQuery(menu).on("click","a",function(e){
    e.preventDefault();
    var cur = pages.children("."+jQuery(this).attr("href").substring(1));
    cur.addClass("shown").siblings().removeClass("shown");
  });
}

module.exports = Pages;
