// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');
const ws = require('ws');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(data);
    }
  });
};

const broadcastUserCount = () => {
  wss.broadcast(JSON.stringify({
    messageType: 'new user count',
    numUsers: wss.clients.size,
  }));
};

let colours = ['lime', 'maroon', 'navy', 'olive']
let index = 0;
const getColour = () => {
  const id = index + 1;
  if (index === colours.length - 1) {
    index = 0;
  } else {
    index = id;
  }
  return colours[index];
}

wss.on('connection', (ws) => {
  broadcastUserCount();
  let colour = getColour();
  console.log('Client connected');
  ws.on('message', function (data) {
    let message = JSON.parse(data);
    if (message.messageType === 'post message') {
      message.id = uuidv4();
      message.messageType = 'chat message';
      message.colour = colour;
    }
    if (message.messageType === 'post notif') {
      message.id = uuidv4();
      message.messageType = 'notification';
    }
    console.log(message);
    wss.broadcast(JSON.stringify(message));
  })

  ws.on('close', () => {
    broadcastUserCount();
    console.log('Client disconnected');
  });
});