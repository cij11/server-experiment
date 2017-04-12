console.log('Hello world');

var a = 1;
a = a + 1;
console.log(a);

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2002);
console.log("Server started");

var SOCKET_LIST = {};

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
  socket.id = Math.random();
  socket.x = 0;
  socket.y = 0;
  SOCKET_LIST[socket.id] = socket; //Store new socket in the socket list

  console.log('socket connection');
});

//Called 25 times a second
setInterval(function(){
  for(var i in SOCKET_LIST){ //Loop through all sockets, update position, emit position to that client
    var socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++;
    socket.emit('newPosition', {
      x:socket.x,
      y:socket.y
    });
  }
}, 1000/25);
