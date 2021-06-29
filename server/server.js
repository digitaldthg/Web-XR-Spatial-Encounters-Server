import Socket from './Classes/Socket';

import Friend from './Classes/Friend';
import Store from './store';
import { Events } from './Classes/Events';

import EnvironmentObject from './Classes/EnvironmentObject';


class Controller {
  events = new Events();
  io = new Socket(this);
  store = new Store(this);
  envObject = new EnvironmentObject(this);

  constructor() {

    this.events.addEventListener("connection", this.OnConnect);
    this.events.addEventListener("disconnect", this.OnDisconnect);



    //setInterval(this.Interval, 500);
    setInterval(this.UserInterval, 500);
    setInterval(this.SendEnvironment, 500);
  }

  OnConnect = (socket) => {
    console.log("connection from ", socket.id);

    this.store.Connect(socket);
    this.envObject.Connect(socket);

    socket.on("client-change-speed", this.ChangeSpeed);
  }

  OnDisconnect = (socket) => {
    console.log("disconnect from ", socket.id);

    Object.values(this.store.rooms).map(room => {
      if (room.users.hasOwnProperty(socket.id)) {
        delete room.users[socket.id];
      }
    });

    this.store.Disconnect(socket);
  }

  UserInterval = () => {
    var users = {};

    //console.log(Object.keys(this.store.users));
    Object.keys(this.store.rooms).map(roomID => {
      var usersInRoom = this.store.GetUsersInRoom(roomID);

      this.io.io.sockets.in(roomID).emit("server-friends-update", usersInRoom);

    });

  }

  ChangeSpeed = (data) => {
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-speed-update", data.speed);
    });
  }

  SendEnvironment = () => {

    Object.keys(this.store.rooms).map(roomID => {
      var usersInRoom = this.store.GetTriangleUser(roomID);

      console.log(usersInRoom.length);
      if (usersInRoom.length >= 2) {
        var tris = this.envObject.CreateTriangle(usersInRoom);
        // tris.Triangles.forEach((triData, idx) => {
        //   console.log("trie frequ", idx, triData.Frequence);
        // });

        this.io.io.sockets.in(roomID).emit("server-environment-update", tris);
      }



      //this.io.io.sockets.in(roomID).emit("server-friends-update", usersInRoom);

    });



    // var users = this.store.GetTriangleUser();

    // if (users.length >= 2) {
    //   var tris = this.envObject.CreateTriangle(users);
    //   tris.Triangles.forEach((triData, idx) => {
    //     console.log("trie frequ", idx, triData.Frequence);
    //   });

    //   this.io.io.emit("server-environment-update", tris);
    // }

  }





}

new Controller();
