/**
 * Custom Eventmanager
 * 
 */
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

  /**
   * 
   * @param {string} eventName Name des Events
   */
  registerEvent(eventName){
    var event = new Event(eventName);
    this.events[eventName] = event;
  }

  /**
   * @param {string} eventName Name des Events
   * @param {object} eventArgs Argumente die beim Event übergeben werden
   */
  dispatchEvent(eventName, eventArgs){
    if(typeof(this.events[eventName]) == "undefined"){return;}
    
    this.events[eventName].callbacks.forEach(function(callback){
      callback(eventArgs);
    });
  }
  /**
   * 
   * @param {string} eventName Name des Events
   * @param {Function} callback Callback-Methode die beim abfeuern des Events aufgerufen werden soll
   */
  addEventListener(eventName, callback){
    this.events[eventName].registerCallback(callback);
  }
}

export {Events};