var TracePoint = require("./Classes/TracePoint");
const UserData = require("./Classes/UserData");

var socketPort = 3000;
var webPort = 3001;
var port = process.env.PORT || 3000;
var io = require('socket.io')(port);
var gameSocket = null;




var friends = {};
var lines = {};
var traceLines = {};

var timeOffset = 0;

var controls = {
  timeOffset : 0,
  locationSync : true
}

gameSocket = io.on('connection', function(socket){
    console.log('socket connected: ' + socket.id);

    //user
    if(!friends.hasOwnProperty(socket.id)){
      friends[socket.id] = UserData({ id : socket.id });
    }


    //trace Object
    if(!traceLines.hasOwnProperty(socket.id)){
      traceLines[socket.id] = {
        id : socket.id,
        linePoints : []
      };
    }


    setInterval(()=>{
      //console.log(Object.keys(friends));
      var sendData = Object.assign({},friends);

      delete sendData[socket.id];      

      

    //  console.log("sendData" , sendData);


      socket.emit("server-friends-update", sendData);
      
      UpdateLines();
      
      
      var sendLineData = Object.assign({},lines);
      //socket.emit("server-lines-update", sendLineData);
      
      

      //send Data for tracelines
      var lines = {};
    
      Object.keys(this.store.users).map(user => lines[user] = {
        id : user,
        color : this.store.users[user].GetColor(),
        linePoints : this.store.users[user].GetLine(this.store.timeOffset)
      });


      var sendTraceData = Object.assign({},traceLines);
      
      //console.log(traceLines, sendTraceData);
      socket.emit("server-trace-update", sendTraceData);



    },1000);

    
    socket.on('disconnect', function(){

      var deletedID = socket.id;

      if(friends.hasOwnProperty(deletedID)){
        delete friends[deletedID];
        //console.log('delete socket id -> because disconnected: ' + deletedID);
      }
      
      if(traceLines.hasOwnProperty(deletedID)){
        delete traceLines[deletedID];
        //console.log('delete trace -> because disconnected: ' + deletedID);
      }

      if(Object.keys(lines).length > 0){
        var toDeleteLineIds = []
        Object.keys(lines).map((lineID)=>{
          if(lines[lineID].users.includes(deletedID)){
            toDeleteLineIds.push(lineID);
          }
        });

        toDeleteLineIds.map(lineID => {
          delete lines[lineID];
        });
        
      }

      socket.broadcast.emit("server-friends-delete", {
        id : deletedID
      });

      console.log('socket disconnected: ' + deletedID);
    });   


    
    socket.on('client-player', function(d){

      if(!friends.hasOwnProperty(socket.id)){friends[socket.id] = UserData(socket.id)}
      
      friends[socket.id] = Object.assign(friends[socket.id], d);
      
      if(traceLines.hasOwnProperty(socket.id)){

        
        traceLines[socket.id].linePoints.push({
          id : socket.id,
          position : d.transform.position,
          timestamp : GetCurrentUnixtime()
        });
      }
      
    });


    socket.on('dev-controls', function(d){

     // console.log(d.value);
      timeOffset = d.timeOffset;

    });

});


function UpdateLines(){
  if(Object.keys(friends).length > 1){


    var sortedFriendKeys = Object.keys(friends).sort();
    var sortedFriends = sortedFriendKeys.map((friend, index)=>{
      if(index < sortedFriendKeys.length - 1){
        var lineKeyName = friends[friend].id + friends[sortedFriendKeys[index + 1]].id;
        if(!lines.hasOwnProperty(lineKeyName)){

          //console.log(friends[friend]);
          var posA = friends[friend].transform.position;
          var posB = friends[sortedFriendKeys[index + 1]].transform.position;

          lines[lineKeyName] = {
            id : lineKeyName,
            users : [friends[friend].id, friends[sortedFriendKeys[index + 1]].id ],
            positions : [posA, posB],
            length : 0
          }
        }
      }
    });
  }
}


function GetCurrentUnixtime(){
  return Date.now()
}
/**/

