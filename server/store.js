import UserObject from './Classes/UserObject';

import User from './Classes/User';


class store{
  friends = {};
  socket =  null;
  users = {};
  timeOffset = 1;

  constructor(context) {
    this.context = context;
  }
  
  BindControls = (socket) => {
    socket.on('dev-controls', (d) => this.timeOffset = d.timeOffset);
  }

  Connect = (socket) =>{
    
    this.users[socket.id] = new User(socket);

    this.BindControls(socket);
  }


  Disconnect(socket){

    delete this.users[socket.id];

    this.context.io.io.emit("server-friends-delete", {
      id : socket.id
    });
  }


}

export default store;