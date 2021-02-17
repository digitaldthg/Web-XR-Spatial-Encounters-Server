import Utils from '../common/Utils';

class TracePoint{
  timestamp = Utils.GetCurrentUnixtime();
  
  position = {
    x : 0,
    y : 0,
    z : 0
  }
  constructor(arg){
    var {position} = arg;

    if(typeof(position) != "undefined"){
      this.position = position;
    }
  }
}
export default TracePoint;