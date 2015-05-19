var Writable = require("stream").Writable;
var split = require("split");
var parseFile, _;

_ = require('underscore');

_.str = require('underscore.string');

var nl = "\n".charCodeAt(0);
var plus = "+".charCodeAt(0);
var neg = "-".charCodeAt(0);
var letterD = "d".charCodeAt(0);
var letterI = "i".charCodeAt(0);
var space = " ".charCodeAt(0);
var at = "@".charCodeAt(0);

function ParseDiffStream(ops){
  Writable.call(this,ops);
  this.files = [];
  this.currentFile = void 0;
  this.state = "unknown";
  this.buffer = "";
}

ParseDiff._write = function(chunk,encoding,next){
  var i=0,l=chunk.length,leftOff=0;
  switch(this.state){
    case "filler":
      while(i < l && chunk[i] !== nl) i++;
      if(i === l) return next();
      break;
    case "indexA":
      leftOff = 0;
      while(i < l && chunk[i] !== space) i++;
      if(i === l){
        this.buffer +=chunk.toString("utf8");
        return next();
      }
      this.currentFile.index = this.buffer + chunk.slice(leftOff,i,"utf8");
      this.buffer = "";
      leftOff = i+1;
      this.state = "indexB";
    case "indexB":
      while(i < l && chunk[i] !== nl) i++;
      if(i === l){
        this.buffer +=chunk.toString("utf8");
        return next();
      }
      this.currentFile.mode = this.buffer + chunk.slice(leftOff,i,"utf8");
      this.buffer = "";
      break;
  }
  this.state = "unknown";
  ChunkLoop:
  for(;i<l;l++){
    switch(chunk[i]){
      case space:
        this.state = "filler";
        while(i < l && chunk[i] !== nl) i++;
        if(i === l) break ChunkLoop;
        this.state = "unknown";
        continue;
      case letterD:
        this.files.push(this.currentFile = {
          index:"",
          mode:0,
          from:"",
          to:"",
          added:0,
          removed:0,
          diffs:[]
        });
        i += 5;
        this.state = "filler";
        while(i < l && chunk[i] !== nl) i++;
        if(i === l) break ChunkLoop;
        this.state = "unknown";
        continue;
      case letterI:
        this.state = "indexA";
        i += 6;
        leftOff = i;
        while(i < l && chunk[i] !== space) i++;
        if(i === l) break ChunkLoop;
        this.currentFile.index = chunk.slice(leftOff,i,"utf8");
        i++;
        leftOff = i;
        this.state = "indexB";
        while(i < l && chunk[i] !== nl) i++;
        if(i === l) break ChunkLoop;
        this.currentFile.mode = chunk.slice(leftOff,i,"utf8");
        this.state = "unknown";
        continue;
      case at:
        this.state = "chunk";

      case plus:
        if(isFileRelated(chunk,i,plus)){

        }
      case neg:
        if(isFileRelated(chunk,i,neg)){

        }

    }
    if(chunk === nl){

    }
  }
  schema = [
    [/^diff\s/, start],
    [/^new file mode \d+$/, new_file],
    [/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/, index],
    [/^---\s/, from_file],
    [/^\+\+\+\s/, to_file],
    [/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/, chunk],
    [/^-/, del],
    [/^\+/, add]
  ];
  parse = function(line) {
    var m, p, _i, _len;
    for (_i = 0, _len = schema.length; _i < _len; _i++) {
      p = schema[_i];
      m = line.match(p[0]);
      if (m) {
        p[1](line, m);
        return true;
      }
    }
    return false;
  };
};

module.exports = function(input) {
  var add, chunk, del, file, files, from_file, index, line, lines, ln_add, ln_del, new_file, noeol, normal, parse, restart, schema, start, to_file, _i, _len;
  if (!input) {
    return [];
  }
  if (input.match(/^\s+$/)) {
    return [];
  }
  lines = input.split('\n');
  if (lines.length === 0) {
    return [];
  }
  files = [];
  file = null;
  ln_del = 0;
  ln_add = 0;
  start = function() {
    file = {
      lines: [],
      deletions: 0,
      additions: 0
    };
    return files.push(file);
  };
  restart = function() {
    if (!file || file.lines.length) {
      return start();
    }
  };
  new_file = function() {
    restart();
    return file["new"] = true;
  };
  index = function(line) {
    restart();
    return file.index = line.split(' ').slice(1);
  };
  from_file = function(line) {
    restart();
    return file.from = parseFile(line);
  };
  to_file = function(line) {
    restart();
    return file.to = parseFile(line);
  };
  chunk = function(line, match) {
    ln_del = +match[1];
    ln_add = +match[3];
    return file.lines.push({
      type: 'chunk',
      chunk: true,
      content: line
    });
  };
  del = function(line) {
    line = line.substring(1);
    file.lines.push({
      type: 'del',
      del: true,
      ln: ln_del++,
      content: line
    });
    return file.deletions++;
  };
  add = function(line) {
    line = line.substring(1);
    file.lines.push({
      type: 'add',
      add: true,
      ln: ln_add++,
      content: line
    });
    return file.additions++;
  };
  noeol = '\\ No newline at end of file';
  normal = function(line) {
    line = line.substring(1);
    if (!file) {
      return;
    }
    return file.lines.push({
      type: 'normal',
      normal: true,
      ln1: line !== noeol ? ln_del++ : void 0,
      ln2: line !== noeol ? ln_add++ : void 0,
      content: line
    });
  };
  schema = [[/^diff\s/, start], [/^new file mode \d+$/, new_file], [/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/, index], [/^---\s/, from_file], [/^\+\+\+\s/, to_file], [/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/, chunk], [/^-/, del], [/^\+/, add]];
  parse = function(line) {
    var m, p, _i, _len;
    for (_i = 0, _len = schema.length; _i < _len; _i++) {
      p = schema[_i];
      m = line.match(p[0]);
      if (m) {
        p[1](line, m);
        return true;
      }
    }
    return false;
  };
  for (_i = 0, _len = lines.length; _i < _len; _i++) {
    line = lines[_i];
    if (!parse(line)) {
      normal(line);
    }
  }
  return files;
};

function isFileRelated(chunk,i,match){
  return chunk[i+1] === match && chunk[i+2] === match;
}

function parseDiff(chunk,i,l){
  var diff = {
    before:{
      start:void 0,
      end:void 0
    },
    after:{
      start:void 0,
      end:void 0
    }
  };
  var start;
  i +=2;
  if(i>=l) throw new Error("too little info");

  while(i < l && chunk[i] === space) i++;
  if(i === l) throw new Error("too little info");
  start = i;
  while(i<l && chunk[i] !== 44) i++;
  if(i === l) throw new Error("too little info");
  diff.start.before = parseInt(chunk.slice(start,i,"utf8"));
  while(i < l && chunk[i] !== space) i++;

  [/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/, chunk],

}

var a = "a".charCodeAt(0);
var b = "b".charCodeAt(0);
function parseFile(chunk,i){
  if(chunk[i+4] === a){
    while()
  }
  if(chunk[i+])
  var t;
  s = _.str.ltrim(s, '-');
  s = _.str.ltrim(s, '+');
  s = s.trim();
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
