import User from './Classes/User';

const fs = require("fs");


class store {
  friends = {};
  rooms = {};
  socket = null;
  users = {};
  timeOffset = 1;
  canCalibrate = true;
  IsRecording = false;
  RecordName = "MyCustomRecording";
  RecordData = [];
  triangleRotationSpeed = 0.01;

  constructor(context) {
    this.context = context;
  }

  BindControls = (socket) => {
    this.socket = socket;
    socket.on('dev-controls', (d) => this.timeOffset = d.timeOffset);

    socket.on("client-change-role", this.ChangeRole);

    socket.on("create-room", this.CreateRoom);
    socket.on("join-room", this.JoinRoom);
    socket.on("leave-room", this.LeaveRoom);

    socket.on("client-record", this.Record);
    socket.on("client-change-calibration", this.ChangeCalibration);
    socket.on("client-change-triangleRotationSpeed", this.ChangeTriangleRotationSpeed);


    socket.on("client-delete-friend", (d) => {
      this.LeaveRoom({id: d.friend.id, room: d.room})
    });

    socket.on("client-hide-friend", this.HideFriend);
  }

  Record = (data) => {
    if (this.IsRecording && data.Record) {
      console.log("already Recording");
    }

    if (this.IsRecording && !data.Record) {
      this.SaveRecording();
    }

    this.IsRecording = data.Record;
    if (data.hasOwnProperty("RecordName")) {
      this.RecordName = data.RecordName;
    }
  }

  AddRecordData(data) {
    this.RecordData.push(data);
  }

  SaveRecording() {
    var fileName = `${
      this.RecordName
    }_${
      Date.now()
    }.json`;
    fs.writeFile(`./records/${fileName}`, JSON.stringify(this.RecordData), err => {
      if (err) {
        return;
      }
    });

    this.RecordData = [];
  }

  /**
   * Kreiiert einen neuen Raum 
   */
  CreateRoom = (data) => {
    if (!this.rooms.hasOwnProperty(data.room)) {

      this.rooms[data.room] = {
        users: {}
      };
      this.rooms[data.room].users[data.id] = null;

      this.context.io.sockets[data.id].join(data.room);

      this.context.io.io.to(data.id).emit("room-success", {
        message: "Erfolgreich created" + data.room,
        room: data.room
      });

    } else {
      this.context.io.io.to(data.id).emit("room-error", {
        message: "Sorry! Raumnummer ist bereits vergeben",
        room: data.room
      });
    }
  }

  /**
   * 
   * @param {object} data Rauminformationen {room : ID des Raumes}
   * Falls die Userin sich einem Raum joinen möchte der noch nicht angelegt ist wird ein Fehler zurückgesendet
   */
  JoinRoom = (data) => {
    if (this.rooms.hasOwnProperty(data.room) && this.context.io.sockets.hasOwnProperty(data.id)) {
      this.context.io.sockets[data.id].join(data.room);
      this.rooms[data.room].users[data.id] = null;

      this.context.io.io.to(data.id).emit("room-success", {
        message: "Erfolgreich gejoint" + data.room,
        room: data.room
      });

    } else {
      this.context.io.io.to(data.id).emit("room-error", {
        message: "Sorry! Dieser Raum existiert nicht.",
        room: data.room
      });
    }
  }

  /**
   * Löscht eine spezifische Userin aus dem Raum
   */
  LeaveRoom = (data) => {
    console.log("leave-room", data);

    if (this.rooms.hasOwnProperty(data.room)) {
      delete this.rooms[data.room].users[data.id];
    }

    this.context.events.dispatchEvent("disconnect", data);
  }

  /**
   * Ändert die Sichtbarkeit eines Friends
   * @param {object} d Enthält Informationen über den Raum und den Friend
   */
  HideFriend = (d) => {
    if (this.rooms.hasOwnProperty(d.room)) {
      this.users[d.friend.id].data.visible = d.visible;
    }
  }

  /**
   * 
   * @param {string} roomID ID des Raumes
   * @returns Alle User in einem Raum
   */
  GetUsersInRoom(roomID) {
    var usersInRoom = {}
    if (this.rooms.hasOwnProperty(roomID)) {

      Object.keys(this.rooms[roomID].users).map(id => {
        if (this.users.hasOwnProperty(id)) {
          usersInRoom[id] = this.users[id].GetUser();
        }
      });

    }

    return usersInRoom;
  }

  /**
   * 
   * @param {object} socket Die Socket 
   */
  Connect = (socket) => {

    this.users[socket.id] = new User(socket);

    //Knüpft alle Events an die socket 
    this.BindControls(socket);
  }

  /**
   * Wird ausgesandt wenn sich eine Userin von einem Raum disconnected
   * @param {object} socket Die Socket
   * 
   */
  Disconnect = (socket) => {

    var socketID = socket.id;

    Object.keys(this.rooms).map(roomID => Object.keys(this.rooms[roomID].users).map(userID => {
      if (socket.id == userID) {
        delete this.rooms[roomID].users[userID];
      }
    }));

    //löscht die Userin aus dem UserObject
    delete this.users[socket.id];

    //sendet die information vom löschen der Userin an die verbundenen Clients
    this.context.io.io.emit("server-friends-delete", {id: socketID});
  }

  /**
   * 
   * @param {object} data Platzhaltermethode um die Rolle einer Userin zu ändern
   */
  ChangeRole = (data) => {
    if (this.users.hasOwnProperty(data.id)) {
      this.users[data.id].data.role = data.role;
    }
  }
  /**
   * Toggelt die Möglichkeit das sich die Clients neu Kalibrieren können
   * @param {object} data 
   */
  ChangeCalibration = data => {
    this.canCalibrate = data.canCalibrate;

    this.context.io.io.emit("server-change-calibration", {canCalibrate: this.canCalibrate});
  }

  /**
   * Ändert die Rotationsgeschwindigkeit der neu gespawnten Dreiecke
   * @param {object} d SettingsObject
   * 
   */
  ChangeTriangleRotationSpeed = (d) => {
    this.triangleRotationSpeed = d.triangleRotationSpeed;
    this.context.io.io.emit("server-change-triangleRotationSpeed", {triangleRotationSpeed: this.triangleRotationSpeed});
  }

  /**
   * 
   * @param {string} roomID ID des Raumes
   * @returns {object} Alle sichtbaren Userinnen die sich potentiell mit einem Dreieck verbinden lassen
   */
  GetTriangleUser = (roomID) => {
    if (Object.keys(this.users).length == 0) {
      return []
    }

    var users = Object.keys(this.rooms[roomID].users).map(userID => this.users[userID]);
    users = users.filter(u => u.data.visible);
    return users;
  }

}

export default store;
