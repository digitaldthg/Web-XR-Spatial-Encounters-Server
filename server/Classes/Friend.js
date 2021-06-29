import UserData from "./UserData";

class Friend{

  constructor(args){
    Object.assign(this, UserData(args));
    //console.log("friend" , this);
  }
}

export default Friend;