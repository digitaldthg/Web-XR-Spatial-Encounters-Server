import Socket from './Classes/Socket';
import UserObject from './Classes/UserObject';
import Friend from './Classes/Friend';
import Store from './store';
import {Events} from './Classes/Events';

class Controller{
  events = new Events();
  store = new Store(this);
  io = new Socket(this);
  
  constructor(){
    
    this.events.addEventListener("connection", this.OnConnect);
    this.events.addEventListener("disconnect", this.OnDisconnect);


    //setInterval(this.Interval, 500);
    setInterval(this.UserInterval, 500);
  }

  OnConnect = (socket) => {
    console.log("connection from ", socket.id);

    this.store.Connect(socket);


  }
  
  OnDisconnect = (socket) =>{
    console.log("disconnect from ", socket.id);
    this.store.Disconnect(socket);
  }

  UserInterval = ()=>{

    
    var users = {};
    Object.keys(this.store.users).map(user => users[user] = this.store.users[user].GetUser());
    var lines = {};
    
    Object.keys(this.store.users).map(user => lines[user] = {
      id : user,
      color : this.store.users[user].GetColor(),
      linePoints : this.store.users[user].GetLine(this.store.timeOffset)
    });

    this.io.io.emit("server-friends-update", users);
    this.io.io.emit("server-trace-update",lines);
  }
}

new Controller();
