import WebMidi, { InputEventNoteon, InputEventNoteoff } from "webmidi";
global.navigator = require('web-midi-api');

class MidiController {
    constructor(server, envObj) {
        this.server = server
        this.envObj = envObj
        this.enableMidi();
    }

    enableMidi() {
       
        WebMidi.enable((err) => {

            if (err) {
                console.log("WebMidi could not be enabled.", err);
            } else {
                console.log("WebMidi enabled!");


                var input = WebMidi.getInputByName("nanoKONTROL2 SLIDER/KNOB");
                if (!input) { return; }

                input.addListener('controlchange', "all",
                    (e) => {
                        //console.log(e);
                        switch (e.controller.number) {
                            case 0:
                            this.server.ChangeSpeed({ speed: Math.max(0.0001, e.value / 127) }); break;
                            case 1:
                            var frequ = { frequency: (e.value / 127) * 3 }; 
                            this.server.ChangeFrequency(frequ);
                            break;
                            case 2:
                            var op= { opacity: (e.value / 127)}; 
                            this.server.ChangeOpacity(op);
                            break;
                            case 3:
                            var fog = { fog: (e.value / 127)}; 
                            this.server.ChangeFog(fog);
                            break;
                            case 41:console.log("Single"); if (e.value == 127) {
                                this.server.SendSingleTriangle();
                            } break;
                            default: break;
                        }


                    }
                );
            }

        });

    }
}

export default MidiController;