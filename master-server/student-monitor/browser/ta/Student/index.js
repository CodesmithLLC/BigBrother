

function Student(student){
  this.worker = new Worker("/student-worker.js");
  this.worker.postMessage({
    event:"initialize",
    data:student
  });
}


Student.prototype.loadRanges = function(type,ranges,cb){
  var l,id=Math.random()+"_"+Date.now();
  var self = this;
  this.worker.addEventListener("message", l = function(e){
    if(e.data.event !== id) return;
    self.worker.removeEventListener("message",l);
    if(e.data.error) return cb(e.data.error);
    cb(void 0, e.data.data);
  });
  tempWorker.postMessage({
    id:id,
    event:"ranges",
    data:{
      type:type,
      range:ranges
    }
  });
};

module.exports = Student;
