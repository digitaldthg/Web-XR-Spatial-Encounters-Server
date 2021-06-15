var port = 3333;
var io = require('socket.io')(port,{ 
  cors: {
    origin: '*',
  }
});

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