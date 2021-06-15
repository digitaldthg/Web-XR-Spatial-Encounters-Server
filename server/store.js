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

    socket.on("client-change-role", this.ChangeRole);
    
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

  ChangeRole = (data) =>{
    if(this.users.hasOwnProperty(data.id)){
      this.users[data.id].data.role = data.role;
    }
  }
  

  GetTriangleUser = () => {
    if(Object.keys(this.users).length == 0){return []}

    var users = Object.keys(this.users).map( id => {
      if(this.users[id].data.role == 0){
        return this.users[id];
      }else{
        return null;
      }
    }).filter(u => u != null);//s .map((id)=> {console.log(id); return this.users[id] });
    

    return users;
  }

}

export default store;