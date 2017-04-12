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

//On connection of a client to the socket, append an id and positoin ot the socket, and
//store in the SOCKET_LIST
io.sockets.on('connection', function(socket){
  socket.id = Math.random();
  socket.x = 0;
  socket.y = 0;
  socket.number = "" + Math.floor(10* Math.random());
  SOCKET_LIST[socket.id] = socket; //Store new socket in the socket list

  console.log('socket connection');
  var keys = Object.keys(SOCKET_LIST);
  console.log('Number of connections = ' + keys.length);

  socket.on('disconnect', function(){
    delete SOCKET_LIST[socket.id];
  })
});

//Called 25 times a second
setInterval(function(){
  var pack = []; //Information about all players in the game

  for(var i in SOCKET_LIST){ //Loop through all sockets, add positional to a packet
    var socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++;
    pack.push({
      x:socket.x,
      y:socket.y,
      number:socket.number
    })
  }

  //Loop through all sockets, send position packet
  for(var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.emit('newPositions', pack);
  }
}, 1000/25);
