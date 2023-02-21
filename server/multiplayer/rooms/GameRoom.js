import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
import { Room } from "colyseus";
import { PlayerEntity } from "../entities/PlayerEntity.js";

/* export class WorldState extends Schema {
    constructor() {
        super();
        this.players = new MapSchema();
    }
}
 */

/* General Overview
 * 1. User starts the game on their Echo Show, connects to server which sets up a PlayerEntity for them
 * 2. User can tap directly on screen to control their character
 * 3. User can show a QR code on their Echo Show which encodes their PlayerID 
 * 4. User scans the QR code on their phone to load a controller UI w/ their PlayerID
 * 5. Controller connects to server along with the Player ID, server now knows which player to process these inputs for
 */

export class GameRoom extends Room {
    
    onCreate(options) {
        console.log("Chat Room Created!!!", options);
        console.log('created');
        this.broadcast("message", `(New Room Created!)`);

/*         this.onMessage("message", (client,data)=>{
            console.log(`received${data}`);
            var jsonData = JSON.parse(data);
            this.broadcast("message", `(${jsonData.name}) ${jsonData.chat}`);
        }) */
    }

    onJoin(client, options) {
        console.log('joined');
        //this.broadcast("messages", `${ client.sessionId } joined.`);
        this.onMessage("message", (client,data)=>{
            console.log(`received${data}`);
            var jsonData = JSON.parse(data);
            //window.nameOfClient = jsonData.name;
            
            this.broadcast("message", `(${jsonData.name}) ${jsonData.chat}`);
        })
    }

    onLeave(client, options) {
        //this.broadcast("messages", `${ window.nameOfClient} left.`);
    }

    update (dt) {
        this.state.players.forEach((player, playerId) => {
            player.update(dt);
        });
    }
}
