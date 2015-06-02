
var React = require("react");


var Pages = React.createClass({
  getInitialState: function() {
    return {currentPage: -1};
  },
  setPage: function(index,e){
    if(e) e.preventDefault();
    this.setState({currentPage:index});
  },
  renderTitle:function(item,index){
    return (<li>
      <a href="#" class="title" onClick={this.setPage.bind(this,index)}>
        {item.props.title||"Page: "+index}
      </a>
    </li>)
  },
  renderPage:function(item,index){
    return (<li
      style={{display:index === this.state.currentPage?"block":"none"}}
    >{item}</li>)
  },
  render: function(){
    var titles = [];
    var pages = [];
    var self = this;
    this.props.children.forEach(function(item,index){
      titles.push(self.renderTitle(item,index));
      pages.push(self.renderPage(item,index));
    });
    return (<div>
      <ul class="menu">{titles}</ul>
      <ul class="pages">{pages}</ul>
    </div>)
  }
});

module.exports = Pages;
