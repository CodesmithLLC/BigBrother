var Flash = require("../../../../Abstract/browser-flash/index.react.js");
var HelpRequest = require("../../../help-request/browser/student/index.react.js");
var React = require('react')

var Main = React.createClass({
  componentDidMount: function(){
    window.flash = this.refs.flash.postMessage.bind(this.refs.flash);
    require("../../../student-monitor/browser/student");
  },
  render: function() {
    return (
      <div>
        <Flash ref="flash"/>
        <HelpRequest />
      </div>
    );
  }
});

window.addEventListener("load",function(){
  React.render(<Main />, document.getElementById("react-container"));
})
