import UserData from "./UserData";

class Friend{
// id = null;
// transform = {
//   position : { x : 0,y : 0, z: 0},
//   rotation : { x : 0,y : 0, z: 0, w : 1},
//   scale : { x : 1,y : 1, z: 1},
// };
// distance = null;
// color = {
//   r : Math.random(),
//   g : Math.random(),
//   b : Math.random()
// };

  constructor(args){
    Object.assign(this, UserData());

    Object.assign(this,args);


    console.log("friend" , this);
  }
}

export default Friend;