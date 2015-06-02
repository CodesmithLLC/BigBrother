var fs = require("fs");
var path = require('path');
require("../browserify-utils").appendCSS(fs.readFileSync(
  path.resolve(require.resolve("highlight.js")+"/../../styles/default.css")
));
var pot = require("../path-object-traversal");
var React = require("react");
var File = require("./file.jsx");

var FileBrowser = React.createClass({
  getInitialState: function() {
    return {
      cwd: "/",
      currentFile:"",
      currentText:false
    };
  },
  changeLocation: function(e){
    console.log("changing location");
    e.preventDefault();
    this.setState({cwd:e.target.getAttribute("href").substring(1)})
  },
  renderDir: function(href){
    var aref = href.split("/");
    var netref = "";
    if(aref.length > 1 && aref[aref.length-1] === "") aref.pop();
    var self = this;
    return aref.map(function(name,index){
      netref += name + "/";
      if(name === "") name = "root";
      return <a
        href={"#"+netref}
        onClick={self.changeLocation}
      >{"/"+name.replace(/%2E/,".")}</a>;
    });
  },
  fileOrFolder: function(href){
    var item = pot.get(this.props.snapshot.filesystem,href);
    if(!item) return <div></div>;
    if(item._id) return this.renderFile(item,href);
    else return this.renderFolder(item,href);
  },
  renderFile: function(file){
    return <File file={file} />
  },
  renderFolder: function(list,href){
    var self = this;
    return <ul>{
      Object.keys(list).map(function(name,index){
        var item = list[name];
        return (
          <li><a
            onClick={self.changeLocation}
            href={"#"+href+name+(item._id?"":"/")}
            class={item._id?"file "+item.mimeType.split("/").join("_"):"directory"}
          >
            {name.replace(/%2E/,".")}
          </a></li>
        );
      })
    }</ul>
  },
  render: function(){
    return <div>
      <h1>Current Path: <span class="current_path">
        {this.renderDir(this.state.cwd)}
      </span></h1>
      {this.fileOrFolder(this.state.cwd)}
    </div>
  }
});

module.exports = FileBrowser;
