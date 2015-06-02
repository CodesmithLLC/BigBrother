var React = require("react");
var sa = require("superagent");
var io = require("socket.io-client");
var Student = require("./Student/index.jsx");

var StudentList = React.createClass({
  getInitialState: function(){
    return {students:[]};
  },
  componentDidMount: function() {
    var file = this.props.file;
    var self = this;
    this.req = sa.get("/Student")
    .end(function(err,res){
      if(err) return console.error(err);
      console.log(res.body);
      self.req = void 0;
      self.setState({
        students: res.body
      });
    });
    var live = io(window.location.origin+"/student-monitor");
    live.on("fsdiff",function(diff){
      console.log("fsdiff: ",diff);
      self.refs[diff.student._id||diff.student].add("FSDiff",diff);
    });
    live.on("commit",function(diff){
      console.log("commit: ",diff);
      self.refs[diff.student._id||diff.student].add("Commit",diff);
    });
  },
  componentWillUnmount: function(){
    if(this.req) this.req.abort();
  },

  render:function(){
    return <ul>{
        this.state.students.map(function(item,index){
          return <Student ref={item._id} student={item} />
        })
      }
    </ul>
  }
});

module.exports = StudentList;
