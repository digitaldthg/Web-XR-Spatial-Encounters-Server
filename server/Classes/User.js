import TracePoint from "./TracePoint";
import Utils from '../common/Utils';

import UserData from "./UserData";

class User{
 
  constructor(socket) {

    this.data = UserData({
      id : socket.id
    });
    
-
    socket.on("client-player", this.Update);

    console.log("Erstelle neuen User " , socket.id);
  }
  Update = (data) =>{
    
    Object.assign(this.data, data);


    this.data.linePoints.push(new TracePoint({
      position : data.transform.position
    }));
    

  }
  GetColor(){
    return this.data.color;
  }
  GetUser(){

    var userData = Object.assign({}, this.data);
    delete userData.linePoints;

    return userData;
  }
  
  GetLine(alpha){
    var max  = this.data.linePoints.length;
    var maxInt = Math.floor(max * alpha);

    var selectedPoints = this.data.linePoints.slice(- maxInt);
    selectedPoints.map(tracePoint => {


      var timedifference = (Utils.GetCurrentUnixtime() - tracePoint.timestamp);
      timedifference *= 0.5;
      tracePoint.position.y += Math.pow( timedifference , 2) * .00000001;

      return tracePoint;
    });
    return selectedPoints;
  }
}

export default User;