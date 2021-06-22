var port = 3333;
var fs = require( 'fs' );
var app = require('express')();
var path = require("path");

var keyFile = fs.readFileSync( path.resolve(__dirname, "../ssl/server.key") );
var certFile = fs.readFileSync( path.resolve(__dirname, "../ssl/server.cert") );

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


var https        = require('https');
var server = https.createServer({
    key: keyFile,
    cert: certFile,
    ca: certFile,
    requestCert: false,
    rejectUnauthorized: false
},app);

server.listen(port,'0.0.0.0');



var io = require('socket.io').listen(server,{
  secure : true
});

//io.set('transports', ['websocket']);

// port,{ 
//   secure: true,
//   cors: {
//     origin: '*',
//   }
// });

class Socket{
  
  constructor(context){
    context.events.registerEvent("connection");
    context.events.registerEvent("disconnect");
    this.io = io;
    this.sockets = {};
    
    io.on('connection', (socket)=>{
      context.events.dispatchEvent("connection", socket);

      this.sockets[socket.id] = socket;

      socket.on("disconnect", ()=>{
        context.events.dispatchEvent("disconnect", socket);

        delete this.sockets[socket.id];
      });
      
      
    });
  }
  
}

export default Socket;