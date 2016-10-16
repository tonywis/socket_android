'use strict'

const config				= require('config'),
			express				= require('express'),
			path					= require('path'),
			http					= require('http');

var		io						= require('socket.io');


const app						= express(),
			app2					= express(),
			socketConfig	= config.get('Customer.server.webSocket'),
			apiConfig			= config.get('Customer.server.api'),
			ROOT_VIEWS 		= { root: path.join(__dirname, '/views') };

var serverIo = http.createServer(app2);
io = io.listen(serverIo);

var clients = [];

app2.get(apiConfig.route, (req, res) => {
	console.log(apiConfig.route+' => Connected');
	res.status(200).sendFile("index.html", ROOT_VIEWS);
});

app.get(apiConfig.route+'/test', (req, res) => {
	console.log(apiConfig.route+'/test => Connected');
	res.status(200).send("Ok");
});

io.sockets.on('connection', function (socket) {
  console.log('SOCKET : Un client est connecté ! ID: '+socket.id);
	clients.push(socket);

  socket.on('send_message', (message) => {
	  var index = clients.indexOf(socket);
	  if (clients.length >= 2) {
	  	var select = index == 0 ? 1 : 0;
	  	console.log(index+" send to "+select);
	  	socket.to(clients[select].id).emit("rec_message", message);
	  }
  });

	socket.on('disconnect', function() {
		console.log('Got disconnect!');
		var i = clients.indexOf(socket);
		clients.splice(i, 1);
	});
});

serverIo.listen(socketConfig.port, socketConfig.host, () => console.log("✓ Server SOCKET started on "+socketConfig.host+":"+socketConfig.port));
app.listen(apiConfig.port, apiConfig.host, () => console.log("✓ Server API started on "+apiConfig.host+":"+apiConfig.port));