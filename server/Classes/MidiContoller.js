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
                        console.log(e);
                        switch (e.controller.number) {
                            case 0: this.server.ChangeSpeed({ speed: Math.max(0.0001, e.value / 127) }); break;
                            case 1: this.envObj.ChangeFrequency({ frequency: (e.value / 127) * 3 }); break;
                            case 2: this.envObj.LerpTheme({ alpha: (e.value / 127) }); break;
                            case 41: if (e.value == 127) {
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