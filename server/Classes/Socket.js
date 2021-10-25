var port = 3333;
var fs = require('fs');
var app = require('express')();
var path = require("path");

// Achtung! : Self signed Certificate - Dieses Zertifikat wurde selbst kreiiert und während des Developments genutzt - Der Browser vertraut diesem Zertifikat nicht - In Produktion sollte ein eigenes Zertifikat eingebunden werden
var keyFile = fs.readFileSync(path.resolve(__dirname, "../ssl/server.key"));
var certFile = fs.readFileSync(path.resolve(__dirname, "../ssl/server.cert"));

//verhindert das nodejs anfragen die über ein self signed Certificate geschickt werden abweist - Achtung - Nur während Development nutzen
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Kreiiert einen Server der über die eigene IP und HTTPS erreichbar ist
var https = require('https');
var server = https.createServer({
  key: keyFile,
  cert: certFile,
  ca: certFile,
  requestCert: false,
  rejectUnauthorized: false
}, app);

server.listen(port, '0.0.0.0');

//Bindet socket.io auf dem Server ein  
var io = require('socket.io').listen(server, {secure: true});


/**
 * Die Socket Instanz
 */
class Socket {

  constructor(context) {
    context.events.registerEvent("connection");
    context.events.registerEvent("disconnect");
    this.io = io;
    this.sockets = {};

    io.on('connection', (socket) => {
      context.events.dispatchEvent("connection", socket);

      this.sockets[socket.id] = socket;

      socket.on("disconnect", () => {
        context.events.dispatchEvent("disconnect", socket);

        delete this.sockets[socket.id];
      });


    });
  }

}

export default Socket;
