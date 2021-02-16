// import { io } from "socket.io-client";
import io from "socket.io-client";
var socket = io.connect('http://192.168.86.31:3000');

socket.on('connection', function (data) {
    console.log(data);
});
socket.on('test', function (data) {
    console.log(data);
});

setInterval(()=>{

  socket.emit('client-test', {
    msg : "hello from client"
  });

},1000)