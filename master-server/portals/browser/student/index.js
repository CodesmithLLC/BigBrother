var flashMessenger = require("../../../Abstract/browser-flash");

window.flash = new flashMessenger(document.getElementById("messages"));


var helpButton = require("../../../help-request/browser/student")();
