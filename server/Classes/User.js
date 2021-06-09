import TracePoint from "./TracePoint";
import Utils from '../common/Utils';

import UserData from "./UserData";

class User{
 
  constructor(socket) {

    this.data = UserData({
      id : socket.id
    });

    socket.on("client-player", this.Update);

  }

  Update = (data) =>{  

    Object.assign(this.data, {
      transform : data.transform,
      color : data.color,
    });
  
  }

  GetUser(){

    var userData = Object.assign({}, this.data);

    return userData;
  }
  
}

export default User;