const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

var {generateMessage,generateLocationMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.emit('newMessage',generateMessage("admin","welcome to chat app"))
  socket.broadcast.emit('newMessage',generateMessage("admin","new user joined"))

  socket.on('createMessage',function(message,callback) {
    console.log("newMessage",message);
    io.emit('newMessage',generateMessage(message.from , message.text));
    callback();
  })
  socket.on('createUSerLocation',function(chord,callback) {
    io.emit('newLocationMessage',generateLocationMessage("admin",chord.latitude,chord.longitude));
    callback();
  })

  socket.on('disconnect', () => {
    console.log('User was disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
