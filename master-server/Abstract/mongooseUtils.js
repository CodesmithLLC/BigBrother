module.exports.objectID2TimeStamp = function(){
  return new Date(parseInt(this.toString().slice(0,8), 16)*1000);
};
