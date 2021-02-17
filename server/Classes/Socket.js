var port = 3000;
var io = require('socket.io')(port);

class Socket{
  
  constructor(context){
    context.events.registerEvent("connection");
    context.events.registerEvent("disconnect");
    this.io = io;
    io.on('connection', (socket)=>{
      context.events.dispatchEvent("connection", socket);

      socket.on("disconnect", ()=>{
        context.events.dispatchEvent("disconnect", socket);
      })
    });
  }
  
}

export default Socket;