import Socket from './Classes/Socket';

import Friend from './Classes/Friend';
import Store from './store';
import {Events} from './Classes/Events';

import EnvironmentObject from './Classes/EnvironmentObject';
import MidiController from './Classes/MidiContoller'

class Controller {
  events = new Events();
  io = new Socket(this);
  store = new Store(this);
  envObject = new EnvironmentObject(this);
  midiController = new MidiController(this, this.envObject)

  // Szenen Parameter
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

    // sendet im Intervall alle Userinformationen
    setInterval(this.UserInterval, 200);
    // sendet im Intervall alle Umgebungsinformationen
    setInterval(this.SendEnvironment, 200);
  }

  /**
   * Wird ausgeführt sobald sich eine Userin mit der Socket verbindet
   * @param {object} socket Die Socket
   */
  OnConnect = (socket) => {

    this.store.Connect(socket);
    this.envObject.Connect(socket);

    /**
     * Default Settings werden beim ersten Connecten mitgeschickt 
     * damit der Client beim gleichen Ausgangspunkt starten kann
     */
    socket.emit("connectResponse", {
      next: this.nextTheme,
      last: this.lastTheme,
      duration: this.duration,
      fog: this.fog,
      speed: this.speed,
      opacity: this.opacity,
      frequency: this.frequency,
      teppich: this.teppich,
      canCalibrate: this.store.canCalibrate,
      triangleRotationSpeed: this.store.triangleRotationSpeed
    });

    /** Einzelne Developer - Settings die von einem Client 
      * aus versandt werden und an alle verbundenen Clients verteilt werden
     */
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

  /**
   *  Wird emitted sobald die Foganimation gestartet wird
   * Sendet den start und end- Wert der Foganimation, sowie die Dauer der Animation
   * @param {object} data 
   */
  SendFogAnimation = (data) => {

    Object.keys(this.store.rooms).map(roomID => {

      this.io.io.sockets. in (roomID).emit("server-fog-animate", data);
      this.fog = 0.0;
    });
  }

  /**
   * Sendet alle Userinformationen über alle im Raum befindlichen Userinnen
   */
  UserInterval = () => {
    var users = {};

    Object.keys(this.store.rooms).map(roomID => {
      var usersInRoom = this.store.GetUsersInRoom(roomID);
      this.io.io.sockets. in (roomID).emit("server-friends-update", usersInRoom);

    });
  }

  /**
   * Emitted die Informationen über eine "Explosion" einer Userin
   * @param {object} data 
   */
  ExplodePlayer = (data) => {
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets. in (roomID).emit("server-player-explode", data);
    });
  }

  /**
   * Emitted die Informationen über einen "Jump" einer Userin
   * @param {object} data 
   */
  JumpPlayer = (data) => {
    this.io.io.sockets.emit("server-player-jump", data);
  }

  /**
   * Wird von einem Developer User clientseitig emitted emittet die Information 
   * mit Start- und End Theme sowie Dauer der Transition an alle verbundenen Clients
   * @param {object} data 
   */
  StartLerpTheme = (data) => {

    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets. in (roomID).emit("server-theme-lerp", data);
      this.duration = data.duration
      this.lastTheme = data.last
      this.nextTheme = data.next
    });

  }
  /**
   * Sendet die Opacity der Startumgebung (Boden und Halle) an alle verbundenen Userinnen
   * @param {object} data 
   */
  ChangeTeppich = (data) => {
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets. in (roomID).emit("server-teppich-update", data.opacity);
      this.teppich = data.opacity
    });
  }

  /**
   * Sendet die aktuelle Fogeinstellung an die verbundenen Userinnen
   * @param {object} data 
   */
  ChangeFog = (data) => {
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets. in (roomID).emit("server-fog-update", data.fog);
      this.fog = data.fog
    });
  }
  /**
   * Sendet die 
   * @param {object} data 
   */
  ChangeOpacity = (data) => {
    Object.keys(this.store.rooms).map(roomID => {
      this.io.io.sockets. in (roomID).emit("server-opacity-update", data.opacity);
      this.opacity = data.opacity
    });
  }

  /**
   * Emitted die Triangle Informationen an alle verbundenen Userinnen
   */
  SendSingleTriangle = () => { // console.log("SEND SINGLE")
    Object.keys(this.store.rooms).map(roomID => {
      var usersInRoom = this.store.GetTriangleUser(roomID);
      if (usersInRoom.length >= 2) {
        var tris = this.envObject.CreateTriangle(usersInRoom);

        this.io.io.sockets. in (roomID).emit("server-single-triangle-update", tris);

        if (this.store.IsRecording) {
          this.store.AddRecordData(this.GenerateTimeStamp({singleTriangle: tris}));
        }

      }
    });
  }

  /**
   * Emitted die Frequenz mit welcher die Dreiecke gespawnt werden an alle gebundenen Userinnen
   * @param {object} data 
   */
  ChangeFrequency = (data) => {
    this.io.io.sockets. in (roomID).emit("server-frequency-update", data.frequency);
    this.frequency = data.frequency;
  }

  /**
   * Emitted die Geschwindigkeit mit welcher die Dreiecke gespawnt werden an alle gebundenen Userinnen
   */
  ChangeSpeed = (data) => {
    this.io.io.sockets. in (roomID).emit("server-speed-update", data.speed);
    this.speed = data.speed;

  }

  /**
   * @returns ein Object mit allen Environmentsettings 
   */
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

  /**
   * Sendet im Intervall alle nötigen Umgebungseinstellungen
   * an die vebundenen Userinnen
   */
  SendEnvironment = () => {

    Object.keys(this.store.rooms).map(roomID => {
      var usersInRoom = this.store.GetTriangleUser(roomID);

      if (usersInRoom.length >= 2) {

        var tris = this.envObject.CreateTriangle(usersInRoom);

        this.io.io.sockets. in (roomID).emit("server-environment-update", tris);

        if (this.store.IsRecording) {

          this.store.AddRecordData(this.GenerateTimeStamp({tris: tris}));
        }


      } else {
        this.io.io.sockets. in (roomID).emit("server-environment-update", {Triangles: []});

        if (this.store.IsRecording) {
          this.store.AddRecordData(this.GenerateTimeStamp({tris: []}));

        }
      }
    });
  }


}

new Controller();
