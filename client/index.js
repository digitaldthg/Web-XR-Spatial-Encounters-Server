// import { io } from "socket.io-client";
import io from "socket.io-client";
var socket = io.connect('http://192.168.86.36:3000');

socket.on('connection', function (data) {
    console.log("connect" , data);
});
