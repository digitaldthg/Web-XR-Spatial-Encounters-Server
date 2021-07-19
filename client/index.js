// import { io } from "socket.io-client";
import io from "socket.io-client";

import config from "../main.config";
var socket = io.connect(config.IP + ':' + config.PORT);

socket.on('connection', function (data) {
    console.log("connect" , data);
});
