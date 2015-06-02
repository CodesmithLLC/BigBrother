
var Pages = require("../../../../Abstract/pages/index.jsx");
var React = require("react");
var StudentList = require("../../../student-monitor/browser/ta/index.jsx");
var HelpRequest = require("../../../help-request/browser/ta/index.jsx");

window.addEventListener("load",function(){
  React.render(<Pages>
    <HelpRequest title="Help Requests" classroom="Demo"/>
    <StudentList title="Student Monitor" />
  </Pages>, document.getElementById("react-container"));
})
