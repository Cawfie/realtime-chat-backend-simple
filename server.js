const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;
const users = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };

    socket.to(room).emit('message', {
      user: 'System',
      text: `${username} has joined the room.`,
    });

    socket.emit('message', {
      user: 'System',
      text: `Welcome to room ${room}, ${username}!`,
    });
  });

  socket.on('chatMessage', (message) => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit('message', {
        user: user.username,
        text: message,
      });
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      socket.to(user.room).emit('message', {
        user: 'System',
        text: `${user.username} has left the room.`,
      });
      delete users[socket.id];
    }
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Serve static files from the "public" directory
app.use(express.static('public'));

