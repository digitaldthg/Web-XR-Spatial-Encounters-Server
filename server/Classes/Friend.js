import UserData from "./UserData";

/**
 * serverseitige Representanz eines connecteten Users der nicht der eigene User ist
 */
class Friend {

  constructor(args) {
    Object.assign(this, UserData(args));
  }
}

export default Friend;
