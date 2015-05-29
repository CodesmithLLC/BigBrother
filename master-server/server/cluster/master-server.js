var ws = require("ws");

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8080 });


wss.on('connection', function connection(ws) {
  ws.on("message",function(message){
    wss.clients.forEach(function(client){
      client.send(message);
    });
  });
});
