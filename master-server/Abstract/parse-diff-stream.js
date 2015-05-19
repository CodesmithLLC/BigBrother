var Writable = require("stream").Writable;

var schema = [
  [/^diff\s/, createFile],
  [/^new file mode \d+$/, isNew],
  [/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/, setIndex],
  [/^---\s/, fromFile],
  [/^\+\+\+\s/, toFile],
  [/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/, chunkOverview],
  [/^-/, del],
  [/^\+/, add]
];

var sl = schema.length;


function ParseDiffStream(){
  Writable.call(this);
  this.buffer = "";
  this.stats = {
    files:[],
    additions:0,
    deletions:0
  };
  var self = this;
  this.on('part',function(part){
    console.log("part");
    part.total = part.additions + part.deletions;
    self.curFile.additions += part.additions;
    self.curFile.deletions += part.deletions;
    self.curFile.parts.push(part);
  });
  this.on('file',function(file){
    console.log("file");
    if(self.curChunk){
      self.emit('part',self.curChunk);
    }
    file.total = file.additions+file.deletions;
    self.stats.additions += file.additions;
    self.stats.deletions += file.deletions;
    self.stats.files.push(file);
  });
  this.on('finish', function() {
    console.log("finish");
    if(self.curFile){
      self.emit('file',self.curFile);
    }
    self.stats.total = self.stats.additions+self.stats.deletions;
    self.emit("full",self.stats);
  });
}

ParseDiffStream.prototype = Object.create(Writable.prototype);
ParseDiffStream.prototype.constructor = ParseDiffStream;

var nl = "\n".charCodeAt(0);

ParseDiffStream.prototype._write = function(chunk,encoding,next){
  console.log("writing");
  var lastIndex = 0, curstr;
  for(var i=0,l=chunk.length;i<l;i++){
    lastIndex = i;
    while(i !== nl && i<l) i++;
    if(i === l) break;
    curstr = this.buffer + chunk.slice(lastIndex,i,"utf8");
    this.buffer = "";
    for (_i = 0; _i < sl; _i++) {
      p = schema[_i];
      m = curstr.match(p[0]);
      if (m){
        p[1].call(this,curstr, m);
        break;
      }
    }
  }
  this.buffer = chunk.slice(lastIndex).toString("utf8");
  next();
};

module.exports = ParseDiffStream;

function createFile(line,matches){
  if(this.curFile){
    this.emit("file",this.curFile);
    this.curChunk = void 0;
  }
  this.curFile = {
    new: false,
    index: void 0,
    mode: void 0,
    chunks: [],
    deletions: 0,
    additions: 0
  };
}

function isNew(line,matches){
  this.curFile.new = true;
}

function setIndex(line,matches){
  line = line.split(" ");
  this.curFile.index = line[1];
  this.curFile.mode = line[2];
}

function fromFile(line,matches){
  this.curFile.from = parseFile(line);
}

function toFile(line,matches){
  this.curFile.to = parseFile(line);
}


function parseFile(s) {
  var t;
  s = s.substring(3).trim();
  t = /\d{4}-\d\d-\d\d\s\d\d:\d\d:\d\d(.\d+)?\s(\+|-)\d\d\d\d/.exec(s);
  if (t) {
    s = s.substring(0, t.index).trim();
  }
  if (s.match(/^(a|b)\//)) {
    return s.substr(2);
  } else {
    return s;
  }
}

function chunkOverview(line,matches){
  if(this.curChunk){
    this.emit("part",this.curChunk);
  }
  this.curChunk = {
    before:{
      start:matches[0],
      length:matches[1]
    },
    after:{
      start:matches[2],
      length:matches[3]
    },
    deletions: 0,
    additions: 0
  };
}

function del(line,matches){
  this.curChunk.deletions++;
}
function add(line,matches){
  this.curChunk.additions++;
}
