import UserData from "./UserData";
/**
 * Serverseitige Representation einer Userin
 * Updated onTick (client-player) die jeweilige Userinformation
 */
class User {

  constructor(socket) {

    this.data = UserData({id: socket.id});

    socket.on("client-player", this.Update);

  }

  Update = (data) => {
    Object.assign(this.data, {
      transform: data.transform,
      color: data.color
    });
  }

  GetUser() {
    var userData = Object.assign({}, this.data);
    return userData;
  }

}

export default User;
