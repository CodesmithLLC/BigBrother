var React = require("react");
var Pages = require("../../../../Abstract/pages/index.jsx");
var FileBrowser = require("../../../../Abstract/file-browser/index.jsx");
var io = require("socket.io-client");
var sa = require("superagent");

var HelpRequest = React.createClass({
  render: function() {
    return (
      <ul title="Help Requests" >
        {this.props.allHelps.map(function(key,index){
          return (
            <li>
              {this.props.renderHelp(key,index)}
              {this.props.renderHelpButtons(key,index)}
            </li>
          );
        })}
      </ul>
    );
  }
});

module.exports = HelpRequest;
