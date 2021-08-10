import User from './Classes/User';


class store{
  friends = {};
  rooms = {};
  socket =  null;
  users = {};
  timeOffset = 1;

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

    socket.on("client-delete-friend", (d)=>{
      this.LeaveRoom({
        id: d.friend.id,
        room : d.room
      })
    });
    
    socket.on("client-hide-friend", this.HideFriend);


  }

  CreateRoom = (data) => {


    if(!this.rooms.hasOwnProperty(data.room)){

      this.rooms[data.room] = { users : {}};
      this.rooms[data.room].users[data.id] = null;
      
      //console.log(this.context.io.sockets[data.id]);

      this.context.io.sockets[data.id].join(data.room);

      this.context.io.io.to(data.id).emit("room-success", {
        message : "Erfolgreich created" + data.room,
        room : data.room
      });

      console.log("room success  " , data.room);
      //create
    }else{
      this.context.io.io.to(data.id).emit("room-error", {
        message : "Sorry! Raumnummer ist bereits vergeben",
        room : data.room
      });
      console.log("room error  " , data.room);
    }
  }
  JoinRoom = (data) => {
    console.log("join Room ", data );
    if(this.rooms.hasOwnProperty(data.room) && this.context.io.sockets.hasOwnProperty(data.id)){
      this.context.io.sockets[data.id].join(data.room);
      this.rooms[data.room].users[data.id] = null;

      this.context.io.io.to(data.id).emit("room-success", {
        message : "Erfolgreich gejoint" + data.room,
        room : data.room
      });

      //console.log("room success  " , data.room);
    }else{
      this.context.io.io.to(data.id).emit("room-error", {
        message : "Sorry! Dieser Raum existiert nicht.",
        room : data.room
      });
     

      console.log("room existiert noch nicht " , data.room);
    }
  }

  LeaveRoom = (data) => {
    console.log("leave-room" , data);

    if(this.rooms.hasOwnProperty(data.room)){
      delete this.rooms[data.room].users[data.id];
      console.log("deleted user from room! There are still" , Object.keys(this.rooms[data.room].users).length , " in room: " , data.room);
    }else{
      console.log("room didnt exist");
    }
    
    this.context.events.dispatchEvent("disconnect", data);
  }

  HideFriend = (d) => {
    if(this.rooms.hasOwnProperty(d.room)){
      this.users[d.friend.id].data.visible = d.visible;
    }
  } 

  GetUsersInRoom(roomID){
    var usersInRoom = {}
    if(this.rooms.hasOwnProperty(roomID)){
      
      Object.keys(this.rooms[roomID].users).map(id => {
        if(this.users.hasOwnProperty(id)){ 
          usersInRoom[id] = this.users[id].GetUser();
        } 
      });

    }

    return usersInRoom;
  }

  Connect = (socket) =>{
    
    this.users[socket.id] = new User(socket);
    //console.log("connect from Connect store.js", socket);
    this.BindControls(socket);
  }


  Disconnect = (socket) => {
    
    var socketID = socket.id;
    console.log("disconnect socket", socket.id, socketID);
    
    Object.keys(this.rooms).map(roomID => Object.keys(this.rooms[roomID].users).map(userID => {
      
      console.log(userID, socket.id, userID == socket.id);
      if( socket.id == userID){
        console.log("delete user in room");
        delete this.rooms[roomID].users[userID];
      }
    }));
    
    delete this.users[socket.id];
    this.context.io.io.emit("server-friends-delete", {
      id : socketID
    });
  }

  ChangeRole = (data) =>{
    if(this.users.hasOwnProperty(data.id)){
      this.users[data.id].data.role = data.role;
    }
  }
  

  GetTriangleUser = (roomID) => {
    if(Object.keys(this.users).length == 0){return []}

    var users = Object.keys(this.rooms[roomID].users).map(userID => this.users[userID]);
    users = users.filter(u => u.data.visible);
    return users;
  }

}

export default store;