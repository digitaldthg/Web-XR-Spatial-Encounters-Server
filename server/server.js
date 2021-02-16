var TracePoint = require("./Classes/TracePoint");

var socketPort = 3000;
var webPort = 3001;
var port = process.env.PORT || 3000;
var io = require('socket.io')(port);
var gameSocket = null;


var friends = {};
var lines = {};
var traceLines = {};

var timeOffset = 0;

gameSocket = io.on('connection', function(socket){
    console.log('socket connected: ' + socket.id);

    //user
    if(!friends.hasOwnProperty(socket.id)){
      friends[socket.id] = {
        id : socket.id,
        transform : {
          position : { x : 0,y : 0, z: 0},
          rotation : { x : 0,y : 0, z: 0, w : 1},
          scale : { x : 1,y : 1, z: 1},
        },
        distance : 0,
        color : {
          r : Math.random(),
          g : Math.random(),
          b : Math.random()
        }
      }
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

      // Object.keys(sendData).map((user)=>{
      //   sendData[user].transform.position.x = Math.sin(Date.now() * .002) * 5
      //   sendData[user].transform.position.y = 2 + Math.sin(Date.now() * .0002) * 2
      //   sendData[user].transform.position.z = Math.cos(Date.now() * .002) * 5

      //   // if(!traceLines.hasOwnProperty(socket.id)){
      //   //   traceLines[socket.id] = {
      //   //     id : socket.id,
      //   //     linePoints : []
      //   //   };
      //   // }
      //     // traceLines[socket.id].linePoints.push({
      //     //   position : sendData[user].transform.position
      //     // });
        
      // });
      
      
      socket.emit("server-friends-update", sendData);
      
      
      
      UpdateLines();
      
      
      var sendLineData = Object.assign({},lines);
      //socket.emit("server-lines-update", sendLineData);
      
      


      var sendTraceData = Object.assign({},traceLines);
      
      // Object.keys(traceLines).map((tL)=>{
      //   console.log(traceLines[tL].linePoints.length);
      // })

      //console.log(traceLines)

      // Object.keys(sendTraceData).map(trace => {
      //   var filteredArray = Array.from(sendTraceData[trace].linePoints);
      //   var max = filteredArray.length;

      //   var maxInt = Math.floor(max * timeOffset);
      //   //console.log(sendTraceData[trace]);

      //   filteredArray = filteredArray.slice(max,max - maxInt);// .filter( tracePoint => (tracePoint.timestamp > (GetCurrentUnixtime() - (30000000 * timeOffset)) ))
      
      //   console.log("filteredArray" , filteredArray.length);

      //   sendTraceData[trace].linePoints = filteredArray;
      // });

      

      //console.log(traceLines, sendTraceData);
      socket.emit("server-trace-update", sendTraceData);



    },200);





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
      
      friends[socket.id] = Object.assign(friends[socket.id], d);
      
      if(traceLines.hasOwnProperty(socket.id)){

        
        traceLines[socket.id].linePoints.push({
          id : socket.id,
          position : d.transform.position,
          timestamp : GetCurrentUnixtime()
        });
      }
      
    });


    socket.on('dev-change-time', function(d){

      console.log(d.value);
      timeOffset = d.value;

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


