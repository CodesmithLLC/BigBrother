var React = require("react");
var Pages = require("../../../../Abstract/pages/index.jsx");
var FileBrowser = require("../../../../Abstract/file-browser/index.jsx");
var io = require("socket.io-client");
var sa = require("superagent");

var HelpRequest = React.createClass({
  getInitialState: function() {
    return {currentHelp: void 0, allHelps: [],snapshot:{}};
  },
  componentDidMount: function(){
    this.setupCurrentHelp();
    this.setupList();
  },
  setupCurrentHelp: function(){
    var self = this;
    this.io = io(window.location.origin+"/help-request");
    this.io.on("go-help",function(help){
      console.log("go help");
      self.setState({currentHelp:help});
    });
    this.io.on("end-help",function(){
      console.log("end-help");
      self.setState({currentHelp:void 0});
    });
  },
  setupList: function(){
    var self = this;
    this.io.on("request",function(help){
      if(self.state.currentHelp && help._id === self.state.currentHelp._id){
        self.state.currentHelp = void 0;
      }
      self.state.allHelps.push(help);
      self.setState({allHelps:self.state.allHelps});
    });
    this.io.on("help-taken",function(help_id){
      console.log("taken");
      self.state.allHelps.splice(self.state.allHelps.indexOf(help),1);
      self.setState({allHelps:self.state.allHelps});
    });
    sa.get("/HelpRequest?populate=student&sort=-createdOn").end(function(err,res){
      if(err) throw err;
      console.log(res.body);
      self.setState({allHelps:res.body});
    });
  },
  viewFiles: function(help,e){
    this.refs.pages.setPage(1);
    if(this.state.snapshot === help.snapshot) return;
    this.setState({snapshot: help.snapshot});
  },
  takeHelp: function(id,e){
    this.io.emit("help-take",id);
  },
  renderHelpItem: function(item,index){
    return (
      <div>
        <p><label>Student: </label>{item.student.name}</p>
        <p class={this.props.classroom==item.classroom?'local':'remote'}>
          <label>Class: </label>{item.classroom}
        </p>
        <p><label>Subject: </label>{item.subject}</p>
        <p class="readmore">{item.description}</p>
      </div>
    );
  },
  renderHelpButtons: function(item,index){
    return [
      <button
        class="take"
        onClick={this.takeHelp.bind(this,item._id)}
      >
        Take
      </button>,
      <button
        class="view-files"
        onClick={this.viewFiles.bind(this,item)}
      >
        View Files
      </button>
    ];
  },
  render: function() {
    var self = this;
    return (
      <div>
        <div>
          {
            this.state.currentHelp?[
              this.renderHelpItem(this.state.currentHelp),
              <FileBrowser title="File Browser" snapshot={this.state.currentHelp.snapshot} />
            ]:""
          }
        </div>
        <Pages
          ref="pages"
          style={{display:typeof this.state.currentHelp !== "undefined"?"none":"block"}}
        >
          <ul title="Help Requests" >
            {this.state.allHelps.map(function(item,index){
              return (
                <li>
                  {self.renderHelpItem(item,index)}
                  {self.renderHelpButtons(item,index)}
                </li>
              );
            })}
          </ul>
          <FileBrowser title="File Browser" snapshot={this.state.snapshot} />
        </Pages>
      </div>
    );
  }
});

module.exports = HelpRequest;
