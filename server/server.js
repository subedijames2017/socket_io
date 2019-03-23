const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
var fs = require('fs'); // required for file serving

const { generateMessage, generateLocationMessage, generateImageMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation')
const { Users } = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
app.use(express.static(publicPath));

io.on('connection', (socket) => {
  socket.on('join', (params, callback) => {
    console.log("connected user", params)
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Need name and room field')
    }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);
    io.to(params.room).emit('updateUserList', users.getUserList(params.room))

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} just joint the room`));
    callback();
  })

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    }

  });
  socket.on('user image', function (msg) {
    var user = users.getUser(socket.id);
    let image = msg;
    io.to(user.room).emit('user image', generateImageMessage(user.name, image));
    // socket.broadcast.emit('user image', socket.nickname, msg);
  });

  socket.on('disconnect', () => {
    console.log("user disconnected");
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      socket.broadcast.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} just left the room`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
