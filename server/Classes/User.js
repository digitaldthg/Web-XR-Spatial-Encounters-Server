import TracePoint from "./TracePoint";
import Utils from '../common/Utils';

class User{
  data = {
    id : null,
    transform : {
      position : { 
        x : 0,
        y : 0, 
        z : 0
      },
      rotation : { x : 0,y : 0, z: 0, w : 1},
      scale : { x : 1,y : 1, z: 1},
    },
    distance : 0,
    color : {
      r : Math.random(),
      g : Math.random(),
      b : Math.random()
    },
    linePoints : [],
  }


  constructor(socket) {
    this.data.id = socket.id;

    socket.on("client-player", this.Update);

    console.log("Erstelle neuen User " , socket.id);
  }
  Update = (data) =>{
    


    this.data.transform.position = data.transform.position;

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

    console.log(userData);

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