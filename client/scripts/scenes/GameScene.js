import PlayerEntity from "../entities/PlayerEntity.js";
import { client } from "../networking.js";

export default class GameScene extends Phaser.Scene {

    init(data) {
        this.alexaEvents = data.alexaEvents;
    }

    preload() {
        this.load.spritesheet("robot", "assets/sprites/character_robot_sheet.png", {frameWidth: 96, frameHeight: 128});
        this.music = new Howl({
            src: ['assets/music/Night\ at\ the\ Beach.ogg'],
            autoplay: true,
            loop: true
        });
    }
    
    create() {
        this.cameras.main.setBackgroundColor('#ffffff');
        let createAnimation = (key, frames) => this.anims.create({key, frameRate: 10, frames, repeat: -1});
        createAnimation("walk", this.anims.generateFrameNumbers("robot", { start: 36, end: 43 }));
        createAnimation("idle", this.anims.generateFrameNumbers("robot", { start: 0, end: 0 }));

        this.players = {};
        
        client.joinOrCreate("gameRoom", {}).then(room => { 
            this.setupQRCode(room.sessionId);

            room.state.players.onAdd = (player, playerId) => this.addPlayer(player, playerId);
            room.state.players.onRemove = (player, playerId) => this.removePlayer(playerId);

            this.input.on('pointerdown', function(pointer){
                room.send("tapAtPosition", {x: pointer.worldX, y: pointer.worldY});
            }, this);

            room.send("initPlayer", {});
        });

        this.alexaEvents.emit("alexa-speak", "Tap to move, or connect a controller with the QR code");
    }

    addPlayer(player, playerId) {
        let newPlayer = new PlayerEntity(this, player);
        
        player.onChange = () => {   
            newPlayer.onChange(player);
        }

        this.players[playerId] = newPlayer;
    }

    removePlayer(playerId) {
        if(this.players[playerId] !== undefined) {
            this.players[playerId].destroy();
            delete this.players[playerId];
        }
    }

    update(time, dt) {
        for (const [playerId, player] of Object.entries(this.players)) {
            player.localUpdate(dt);
        }
    }

    setupQRCode(playerId) {
        let controllerUrl = window.location.origin+"?id="+playerId;
        console.log(controllerUrl);
        document.getElementById("qr").src = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data="+controllerUrl;
        document.getElementById("qr").style.display = "block";
    }
}