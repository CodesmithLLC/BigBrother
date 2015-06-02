var React = require("react");
var LineChart = require('react-d3/linechart').LineChart;
var sa = require("superagent");

var Student = React.createClass({
  getInitialState: function(){
    return {
      FSDiff:[],
      Commit:[]
    };
  },
  componentDidMount: function() {
    this.reqs = {};
    var self = this;
    ["FSDiff","Commit"].forEach(function(key){
      self.reqs[key] = sa.get("/Student/"+self.props.student._id+"/"+key,{sort:"-createdAt"})
      .end(function(err,res){
        if(err) return console.error(err);
        delete self.reqs[key];
        var s = {};
        s[key] = res.body;
        self.setState(s);
      });
    })
  },
  add: function(key,item){
    console.log(key,item);
    if(!(key in this.state)) throw new Error("non-existant key");
    this.state[key].push(item);
    this.setState(this.state);
  },
  componentWillUnmount: function(){
    var keys = Object.keys(this.reqs);
    var self = this;
    keys.forEach(function(k){
      self.reqs[k].abort();
    })
  },
  getData: function(){
    console.log(this.state);
    return [
      {
        name:"Commits",
        values:this.state.Commit
      },
      {
        name:"File Changes",
        values:this.state.FSDiff
      }
    ]
  },
  xAccess: function(item){
    return item.createdAt;
  },
  xFormatter: function(x){
    return new Date(x).toLocaleString();
  },
  yAccess: function(item){
    return item.diffObj.total;
  },
  render: function(){
    return (
      <div>
        <h2>{this.props.student.name}</h2>
        <LineChart
          legend={true}
          data={this.getData()}
          xAccessor={this.xAccess}
          xAxisFormatter={this.xFormatter}
          yAccessor={this.yAccess}
          width={800}
          height={300}
          title="Line Chart"
        />
      </div>
    )
  }
});


module.exports = Student;
