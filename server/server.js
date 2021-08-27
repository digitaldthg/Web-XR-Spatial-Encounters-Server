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

  lastTheme = "Dunkel Concrete";
  nextTheme = "Dunkel Concrete";
  duration = 1;
  fog = 0.2;
  speed = 0.1;
  frequency = 3;
  opacity = 0.0;
  teppich = 1;


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

    // console.log("SEND THEMES ON CONNECT ",{next: this.nextTheme, last:this.lastTheme},socket.id)
    //this.io.io.to(socket.id).emit("server-theme-update", {next: this.nextTheme, last:this.lastTheme});
    socket.emit("connectResponse", { 
      next: this.nextTheme, 
      last: this.lastTheme, 
      duration: this.duration, 
      fog: this.fog, 
      speed: this.speed, 
      opacity: this.opacity, 
      frequency: this.frequency,
      teppich:this.teppich,
      canCalibrate : this.store.canCalibrate,
      triangleRotationSpeed : this.store.triangleRotationSpeed
    });

    socket.on("client-change-speed", this.ChangeSpeed);
    socket.on("client-player-explode", this.ExplodePlayer);
    socket.on("client-player-jump", this.JumpPlayer);
    socket.on("client-theme-lerp", this.StartLerpTheme);
    socket.on("client-change-fog", this.ChangeFog);
    socket.on("client-gamepad-event", this.SendSingleTriangle)
    socket.on("client-animate-fog", this.SendFogAnimation)
    socket.on("client-change-opacity", this.ChangeOpacity)
    socket.on("client-change-frequency", this.ChangeFrequency);
    socket.on("client-change-teppich", this.ChangeTeppich);
  }

  SendFogAnimation = (data) => {

    Object.keys(this.store.rooms).map(roomID => {

      this.io.io.sockets.in(roomID).emit("server-fog-animate", data);
      this.fog = 0.0;
    });
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

    //console.log(data);
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-player-explode", data);
    });

  }

  JumpPlayer = (data) => {
      this.io.io.sockets.emit("server-player-jump", data);
  }

  StartLerpTheme = (data) => {

    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-theme-lerp", data);
      this.duration = data.duration
      this.lastTheme = data.last
      this.nextTheme = data.next
    });

  }
  ChangeTeppich = (data) => {
    Object.keys(this.store.rooms).map(roomID => {
      console.log("TEPPICH ",data.opacity)
      this.io.io.sockets.emit("server-teppich-update", data.opacity);
      this.teppich = data.opacity
    });
  }

  ChangeFog = (data) => {
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-fog-update", data.fog);
      this.fog = data.fog
    });
  }
  ChangeOpacity = (data) => {
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets.in(roomID).emit("server-opacity-update", data.opacity);
      this.opacity = data.opacity
    });
  }

  SendSingleTriangle = () => {
    // console.log("SEND SINGLE")
    Object.keys(this.store.rooms).map(roomID => {
      var usersInRoom = this.store.GetTriangleUser(roomID);
      if (usersInRoom.length >= 2) {
        var tris = this.envObject.CreateTriangle(usersInRoom);

        this.io.io.sockets.in(roomID).emit("server-single-triangle-update", tris);

        if (this.store.IsRecording) {

          this.store.AddRecordData(this.GenerateTimeStamp({
            singleTriangle: tris
          }));
        }

      }
    });
  }
  
  ChangeFrequency = (data) => {
    console.log("FREQU ",data.frequency)
      this.io.io.sockets.emit("server-frequency-update", data.frequency);
      this.frequency = data.frequency;  
  }

  ChangeSpeed = (data) => {
    this.io.io.sockets.emit("server-speed-update", data.speed);
    this.speed = data.speed;

  }

  GenerateTimeStamp = (data) => {
    return Object.assign({
      time: Date.now(),
      tris: [],
      frequency: this.frequency,
      fog: this.fog,
      speed: this.speed,
      nextTheme: this.nextTheme,
      lastTheme: this.lastTheme,
      singleTriangle: null
    }, data);
  }


  SendEnvironment = () => {

    Object.keys(this.store.rooms).map(roomID => {
      var usersInRoom = this.store.GetTriangleUser(roomID);

      if (usersInRoom.length >= 2) {

        var tris = this.envObject.CreateTriangle(usersInRoom);

        this.io.io.sockets.in(roomID).emit("server-environment-update", tris);


        if (this.store.IsRecording) {

          this.store.AddRecordData(this.GenerateTimeStamp({
            tris: tris
          }));
        }


      } else {
        this.io.io.sockets.in(roomID).emit("server-environment-update", {
          Triangles: []
        });

        if (this.store.IsRecording) {
          this.store.AddRecordData(this.GenerateTimeStamp({
            tris: []
          }));

        }
      }
    });
  }





}

new Controller();
