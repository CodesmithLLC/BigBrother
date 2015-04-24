//Central Command

var sio_client = require("socket.io-client");

var online = false;

var client = require('socket.io-client')(big_brother_url);

client.on('connect', function(){
	online = true;
});

client.on('event', function(data){
	
});

client.on('disconnect', function(){
	online = false;
});


function connectAs(user){
	s
}

module.exports = client;

