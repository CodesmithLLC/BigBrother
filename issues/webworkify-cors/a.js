var work = require("webworkify");
var w = work(require("./worker"));

var butt, errors, output;

w.addEventListener("message",function(e){
  if(e.data.event !== "result") return;
  if(e.data.error){
    output.style.backgroundColor = "#F00";
    output.style.color = "#FFF";
    output.innerHTML = e.data.error.stack.replace(/\n/g,"<br/>");
  }else{
    output.style.backgroundColor = "#FFF";
    output.style.color = "#000";
    output.innerHTML = e.data.data;
  }
});
w.addEventListener("error",function(e){
  errors.innerHTML += "<li>"+e.message+"</li>";
});

window.addEventListener("load",function(){
  errors = document.querySelector(".errors");
  output = document.querySelector(".output");
  butt = document.querySelector("button");
  butt.addEventListener("click",function(e){
    w.postMessage("hey");
  });
});
