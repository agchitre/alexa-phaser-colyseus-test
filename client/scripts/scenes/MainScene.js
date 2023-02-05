import GameScene from "./GameScene.js";
import ControllerScene from "./ControllerScene.js";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MainScene',
            pack: {
                files: [{
                    type: 'plugin',
                    key: 'rexwebfontloaderplugin',
                    url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexwebfontloaderplugin.min.js',
                    start: true
                }]
            }
        });
    }

    preload() {
        this.plugins.get('rexwebfontloaderplugin').addToScene(this);

        var config = {
            google: {
                families: ['Bungee', 'Righteous', 'Itim']
            }
        };
        this.load.rexWebFont(config);
        this.clientType = undefined;
    }
    
    create() {
        let playerIdForController = new URLSearchParams(window.location.search).get('id');
        //if the url has an id, this is a controller
        if(playerIdForController !== null) {
            this.scene.add('ControllerScene', ControllerScene, true, {playerIdForController:playerIdForController});
        }
        else {
            this.alexaLoaded = false;
            this.alexaEvents = new Phaser.Events.EventEmitter();
            this.setupAlexa();
            this.alexaEvents.on("alexa-speak", (phrase) => {
                if(this.alexaLoaded) {
                    this.alexaClient.skill.sendMessage({
                        intent: "speak",
                        contents: phrase
                    });
                }
            });
            this.alexaEvents.on("alexa-ask", (phrase) => {
                if(this.alexaLoaded) {
                    this.alexaClient.skill.sendMessage({
                        intent: "ask",
                        contents: phrase
                    });
                }
            });

            this.scene.add('GameScene', GameScene, true, {alexaEvents: this.alexaEvents});
        }
    }

    update() {

    }

    setupAlexa() {
        Alexa.create({version: '1.1'})
            .then((args) => {
                const {
                    alexa,
                    message
                } = args;
                this.alexaClient = alexa;
                this.alexaLoaded = true;
                
    
                this.alexaClient.speech.onStarted(() => {
                });
                this.alexaClient.speech.onStopped(() => {
                });
                // Called every time a data payload comes from backend as a message Directive.
                this.alexaClient.skill.onMessage((message) => {   
                    this.alexaEvents.emit(message.intent, message.contents);                 
                });
                this.alexaClient.voice.onMicrophoneOpened(() => {
                });
                this.alexaClient.voice.onMicrophoneClosed(() => {
                });
            })
            .catch(error => {
                console.log("Couldn't connect to Alexa");
                this.alexaClient = null;
            });
    }
}