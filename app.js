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
var PLAYER_LIST = {};

var Player = function(id){
  var self = {
    x:250,
    y:250,
    id:id,
    number: "" + Math.floor(10* Math.random()),
    pressingRight:false,
    pressingLeft:false,
    pressingUp:false,
    pressingDown:false,
    maxSpd:10,
  };
  self.updatePosition = function(){
    if(self.pressingRight)
      self.x += self.maxSpd;
    if(self.pressingLeft)
      self.x -= self.maxSpd;
    if(self.pressingUp)
      self.y -= self.maxSpd;
    if(self.pressingDown)
      self.y += self.maxSpd;
  }
  return self;
}

var io = require('socket.io')(serv,{});

//On connection of a client to the socket, append an id and position to the socket, and
//store in the SOCKET_LIST
io.sockets.on('connection', function(socket){
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket; //Store new socket in the socket list

  //Create a player object. This object will be visible inside this scope,
  //allowing input to be assigned to the correct player for this socket.
  var player = Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  console.log('socket connection');
  var keys = Object.keys(SOCKET_LIST);
  console.log('Number of connections = ' + keys.length);

  socket.on('disconnect', function(){
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id]
  })

  //When keyPress emitted from client, update player input
  socket.on('keyPress', function(data){
    if(data.inputId === 'left')
      player.pressingLeft = data.state;
    else if(data.inputId === 'right')
      player.pressingRight = data.state;
    else if(data.inputId === 'up')
      player.pressingUp = data.state;
    else if(data.inputId === 'down')
      player.pressingDown = data.state;
  });
});

//Called 25 times a second
setInterval(function(){
  var pack = []; //Information about all players in the game

  for(var i in PLAYER_LIST){ //Loop through all sockets, add positional to a packet
    var player = PLAYER_LIST[i];
    player.updatePosition();
    pack.push({
      x:player.x,
      y:player.y,
      number:player.number
    })
  }

  //Loop through all sockets, send position packet
  for(var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.emit('newPositions', pack);
  }
}, 1000/25);
