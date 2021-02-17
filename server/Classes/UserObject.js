import TracePoint from "./TracePoint";

class UserObject{
  id = null;
  transform = {
    position : { x : 0,y : 0, z: 0},
    rotation : { x : 0,y : 0, z: 0, w : 1},
    scale : { x : 1,y : 1, z: 1},
  };
  distance = 0;
  color = {
    r : Math.random(),
    g : Math.random(),
    b : Math.random()
  }

  linePoints = []

  constructor(context, socket) {
    this.context = context;
    this.id = socket.id;
    this.socket = socket;

  }

  // Update = (data) =>{

  //   console.log()

  //   this.transform.position = data.position;
    
  //   this.linePoints.push(new TracePoint({
  //     position : data.position
  //   }))

  //   console.log("update", data.position);
  // }

  Destroy = () =>{
    
    this.socket.emit("server-friends-delete", {
      id : this.socket.id
    });
    this.socket.off("client-player", this.Update);

    this.socket = null;
  }

  GetTrace = (alpha) => {
    var clonedTrace = [...this.linePoints];

    var max = clonedTrace.length;
    var percentageIndex = Math.floor(max * alpha);


    return {
      id : this.id,
      linePoints : clonedTrace.slice(percentageIndex)
    };
  }

  GetMe = () => {
    var clone = {
      id : this.id,
      transform : Object.assign({}, this.transform),
      distance : this.distance,
      color : this.color
    }

    return clone;
  }
  
}

export default UserObject;