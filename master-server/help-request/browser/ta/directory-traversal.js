
function SnapShot(container,snapshotid){
  var history = [];
  var index = 0;
  var currentPath = "/";
  this.pathView = container.find("span.path");
  this.renderContain = container.find("div.render");
  container.find("button.back").on("click",function(){
    if(index < 1) return;
    index--;
    render(history[index]);
  });
  container.find("button.forward").on("click",function(){
    if(index > history.length-2) return;
    index++;
    render(history[index]);
  });
  this.pathView.on("click","a",function(e){
    e.preventDefault();
    goTo(this.getAttribute("href"));
  });
  container.on("click","a.folderItem",function(e){
    e.preventDefault();
    goTo(this.getAttribute("href"));
  });
  this.worker = new Worker("/help-request/worker.js");
}

Snapshot.prototype.goTo = function(path){
  if(index !== history.length-1){
    history = history.slice(0,index);
  }
  history.push(currentPath);
  index++;
  currentPath = path;
  render(currentPath);
};

Snapshot.prototype.render = function(path){
  this.worker.postMessage({event:"retrieve",path:path});
};

module.exports = Snapshot;
