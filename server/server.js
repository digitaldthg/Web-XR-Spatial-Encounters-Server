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

  lastTheme = "Theme DunkelConcrete";
  nextTheme = "Theme DunkelConcrete Morning";
  duration = 1;
  fog = 0;
  speed = 0.1;
  frequency = 3;

  constructor() {

    this.events.addEventListener("connection", this.OnConnect);
    this.events.addEventListener("disconnect", this.store.Disconnect);



    //setInterval(this.Interval, 500);
    setInterval(this.UserInterval, 200);
    setInterval(this.SendEnvironment, 200);
  }

  OnConnect = (socket) => {

    this.store.Connect(socket);
    this.envObject.Connect(socket);

    console.log("SEND THEMES ON CONNECT ",{next: this.nextTheme, last:this.lastTheme},socket.id)
    //this.io.io.to(socket.id).emit("server-theme-update", {next: this.nextTheme, last:this.lastTheme});
    socket.emit("connectResponse", {next: this.nextTheme, last:this.lastTheme, duration:this.duration, fog:this.fog,speed: this.speed});

    socket.on("client-change-speed", this.ChangeSpeed);
    socket.on("client-player-explode", this.ExplodePlayer);
    socket.on("client-theme-lerp", this.StartLerpTheme);
    socket.on("client-change-fog", this.ChangeFog);
    socket.on("client-gamepad-event",this.SendSingleTriangle)
  }

  // OnDisconnect = (socket) => {
  //   console.log("disconnect from ", socket.id);

  //   Object.values(this.store.rooms).map(room => {
  //     if (room.users.hasOwnProperty(socket.id)) {
  //       delete room.users[socket.id];
  //     }
  //   });

  //   this.store.Disconnect(socket);
  // }

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
    Object.keys(this.store.rooms).map(roomID => {
     this.io.io.sockets.in(roomID).emit("server-player-explode" ,data);
    });

  }

  StartLerpTheme = (data) => {

    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-theme-lerp", data);
      this.duration = data.duration
      this.lastTheme = data.last
      this.nextTheme = data.next
    });

  }


  ChangeFog = (data)=>{
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-fog-update", data.fog);
      this.fog = data.fog
    });
  }

  SendSingleTriangle = () => {
    console.log("SEND SINGLE")
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
      this.speed = data.speed
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

        this.frequency = tris.Triangles[0].Frequence;

      }else{
        this.io.io.sockets.in(roomID).emit("server-environment-update", {
          Triangles : []
        });
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
