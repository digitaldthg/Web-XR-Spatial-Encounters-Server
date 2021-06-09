import Socket from './Classes/Socket';

import Friend from './Classes/Friend';
import Store from './store';
import {Events} from './Classes/Events';

import EnvironmentObject from './Classes/EnvironmentObject';


class Controller{
  events = new Events();
  store = new Store(this);
  io = new Socket(this);
  envObject = new EnvironmentObject(this); 
  
  constructor(){
    
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

  }
  
  OnDisconnect = (socket) =>{
    console.log("disconnect from ", socket.id);
    this.store.Disconnect(socket);
  }
  
  UserInterval = ()=>{
    var users = {};
    Object.keys(this.store.users).map(user => users[user] = this.store.users[user].GetUser());  
    this.io.io.emit("server-friends-update", users);
  }


  SendEnvironment =  ()=>{

    var users = this.store.GetTriangleUser();
    if(users.length >= 3){
      this.envObject.ClearTriangles();
      this.envObject.CreateTriangle( users );
    }
    this.io.io.emit("server-environment-update", this.envObject.GetData());
  }





}

new Controller();
