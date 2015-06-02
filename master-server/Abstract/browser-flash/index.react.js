var pvp = require("./pageVisiblePolyfill");
var React = require("react");

var Flash = React.createClass({
  getInitialState: function() {
    var w = this.waiting;
    delete this.waiting;
    return {
      items: this.waiting || [],
      permission:(typeof Notification === "undefined")?"no":"unknown"
    };

  },
  postMessage: function(title,body){
    console.log(document[pvp.hidden]);
    if(document[pvp.hidden] && this.state.permission === "granted"){
      new Notification(title, {body:body});
    }
    this.state.items.push({title:title,body:body});
    this.setState(this.state);
  },
  componentDidMount: function(){
    this.ready = true;
  },
  requestPermission: function(){
    if(this.state.permission !== "unknown") return;
    var self = this;
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      self.setState({permission:permission});
    });
  },
  removeItem: function(index){
    this.state.items.splice(index,1);
    this.setState(this.state);
  },
  render: function(){
    var self = this;
    return <div>
      <button
        style={{display:this.state.permission!=="unknown"?"none":"block"}}
        onClick ={this.requestPermission}
      >
        Show Desktop Notifications
      </button>
      <ul>{
        this.state.items.map(function(item,index){
          return (
            <li onClick={self.removeItem.bind(self,index)}>
              <h1 class="title">{item.title}</h1>
              <p>{item.body}</p>
            </li>
          );
        })
      }</ul>
    </div>
    return
  }
});
module.exports = Flash;
