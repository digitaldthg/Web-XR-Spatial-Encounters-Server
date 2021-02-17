class Event{
  constructor(name){
    this.name = name;
    this.callbacks = [];
  }
  
  registerCallback(callback){
    this.callbacks.push(callback);
  }
}

class Events{
  constructor(){
    this.events = {};
  }

  registerEvent(eventName){
    var event = new Event(eventName);
    this.events[eventName] = event;
  }

  dispatchEvent(eventName, eventArgs){
    if(typeof(this.events[eventName]) == "undefined"){return;}
    
    this.events[eventName].callbacks.forEach(function(callback){
      callback(eventArgs);
    });
  }
  addEventListener(eventName, callback){
    this.events[eventName].registerCallback(callback);
  }
}

export {Events};