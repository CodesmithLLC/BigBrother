var React = require("react");
var sa = require("superagent");
//
var hljs = require('highlight.js/lib/highlight');
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
hljs.registerLanguage('http', require('highlight.js/lib/languages/http'));
//Maybe Later?
//hljs.registerLanguage('typescript', require('highlight/lib/languages/typescript'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'));
//Not sure if we'll need this one
hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));


var File = React.createClass({
  getInitialState: function() {
    return {
      mimeType: void 0,
      text: void 0,
    };
  },
  componentDidMount: function() {
    var file = this.props.file;
    var self = this;
    this.req = sa.get(window.location.origin+"/"+file.parent+"/"+file._id.split("_")[1])
    .end(function(err,res){
      if(err) return console.error(err);
      self.req = void 0;
      self.setState({
        mimeType: file.mimeType.replace(/.*\/(x\-)?/,""),
        text: res.text
      });
    });
  },
  componentDidUpdate: function () {
    this.highlightCode();
  },
  highlightCode: function () {
    var domNode = this.getDOMNode();
    var nodes = domNode.querySelectorAll('code');
    if (nodes.length > 0) {
      for (var i = 0,l=nodes.length; i < l; i++) {
        hljs.highlightBlock(nodes[i]);
      }
    }
  },
  componentWillUnmount: function(){
    if(this.req) this.req.abort();
  },
  render:function(){
    if(typeof this.state.mimeType === "undefined"){
      return <p>Please Wait...</p>
    }
    return (
      <pre>
        <code className={this.state.mimeType}>
          {this.state.text}
        </code>
      </pre>
    )
  }
});


module.exports = File;
