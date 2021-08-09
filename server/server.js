import Socket from './Classes/Socket';

import Friend from './Classes/Friend';
import Store from './store';
import { Events } from './Classes/Events';

import EnvironmentObject from './Classes/EnvironmentObject';
import MidiController from './Classes/MidiContoller'


class Controller {
  events = new Events();
  io = new Socket(this);
  store = new Store(this);
  envObject = new EnvironmentObject(this);
  midiController = new MidiController(this, this.envObject)

  constructor() {

    this.events.addEventListener("connection", this.OnConnect);
    this.events.addEventListener("disconnect", this.OnDisconnect);



    //setInterval(this.Interval, 500);
    setInterval(this.UserInterval, 200);
    setInterval(this.SendEnvironment, 200);
  }

  OnConnect = (socket) => {

    this.store.Connect(socket);
    this.envObject.Connect(socket);

    socket.on("client-change-speed", this.ChangeSpeed);
    socket.on("client-player-explode", this.ExplodePlayer);
    socket.on("client-theme-lerp", this.LerpTheme);
    socket.on("client-theme", this.ChangeTheme);
    socket.emit("test", {
      message : "Hallo Lea"
    });

    socket.on("client-change-fog", this.ChangeFog);
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
  ExplodePlayer = (data) => {

    console.log(data);
    // this.io.io.sockets.in(roomID).emit("server-player-explode" , {
    //   socket : this.io.io.sockets.id
    // });

  }

  LerpTheme = (data) => {

    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-theme-lerp-update", data.alpha);
    });

  }

  ChangeTheme = (data) =>{
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-theme-update", data.name);
    });
  }

  ChangeFog = (data)=>{
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-fog-update", data.fog);
    });
  }

  SendSingleTriangle = () => {
    Object.keys(this.store.rooms).map(roomID => {
      var usersInRoom = this.store.GetTriangleUser(roomID);
      if (usersInRoom.length >= 2) {
        var tris = this.envObject.CreateTriangle(usersInRoom);
        this.io.io.sockets.in(roomID).emit("server-single-triangle-update", tris);
      }
    });
  }



  ChangeSpeed = (data) => {
    console.log("Speed changed:", data.speed, this.store.rooms);
    Object.keys(this.store.rooms).map(roomID => {

      this.io.io.sockets.in(roomID).emit("server-speed-update", data.speed);
    });
  }

  SendEnvironment = () => {

    Object.keys(this.store.rooms).map(roomID => {
      var usersInRoom = this.store.GetTriangleUser(roomID);

      if (usersInRoom.length >= 2) {
        var tris = this.envObject.CreateTriangle(usersInRoom);
        // tris.Triangles.forEach((triData, idx) => {
        //   console.log("trie frequ", idx, triData.Frequence);
        // });


        this.io.io.sockets.in(roomID).emit("server-environment-update", tris);
        this.io.io.sockets.in(roomID).emit("server-frequency-update", tris.Triangles[0].Frequence);
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
