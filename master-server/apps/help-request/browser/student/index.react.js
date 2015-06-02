var sa = require("superagent");
var sio = require("socket.io-client");
var React = require('react')

var HelpRequest = React.createClass({
  getInitialState: function() {
    return {state: "not-sure"};
  },
  componentDidMount: function() {
    var io = this.io = sio(window.location.origin+"/help-request");
    var self = this;
    io.on("help-aware",function(){
      self.setState({state: "wait"});
    });
    io.on("help-finish",function(state){
      console.log("finish: ", state)
      self.setState({state: "none"});
    });
    io.on("help-here",function(){
      self.setState({state: "have"});
    });
  },
  componentWillUnmount: function() {
    this.io.disconnect();
  },
  getHelp:function(e){
    e.preventDefault();
    if(this.state.state !== "none"){
      return flash("Your help request has already been submitted");
    }
    sa.post(
      local_big_brother_url+"/send-help-request"
    ).send(
      {description:this.getDOMNode().querySelector("[name=description]").value}
    ).end(function(err,res){
      if(err) throw err;
      flash("Your Help request has been submitted");
    });
  },
  cancelHelp:function(){
    io.emit("help-cancel");
  },
  giveFeedback:function(e){
    e.preventDefault();
    if(this.state.state === "none"){
      return flash("You're not currently requesting help");
    }
    var boo = this.getDOMNode().querySelector("[name=succeeded]:checked").value;
    if(boo == 1){
      this.io.emit("help-solve");
    }else{
      this.io.emit("help-fail");
    }
  },
  render: function() {
    return (
      <div>
        <form
          onSubmit={this.getHelp}
          style={{display: this.state.state==="none"?"block":"none"}}
        >
          <textarea name="description"></textarea><br />
          <button type="submit" >Request Help</button>
        </form>
        <button
          onSubmit={this.cancelHelp}
          style={{display: this.state.state==="wait"?"block":"none"}}
        >
          Cancel
        </button>
        <form
          onSubmit={this.giveFeedback}
          style={{display: this.state.state==="have"?"block":"none"}}
        >
          <input type="radio" name="succeeded" value="0" defaultChecked={true}/> Failure <br />
          <input type="radio" name="succeeded" value="1" /> Successful <br />
          <button type="submit" >Help Finished</button>
        </form>
      </div>
    );
  }
});


module.exports = HelpRequest;
