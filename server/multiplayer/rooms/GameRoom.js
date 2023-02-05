import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
import { Room } from "colyseus";
import { PlayerEntity } from "../entities/PlayerEntity.js";

export class WorldState extends Schema {
    constructor() {
        super();
        this.players = new MapSchema();
    }
}

defineTypes(WorldState, {
    players: { map: PlayerEntity}
})

/* General Overview
 * 1. User starts the game on their Echo Show, connects to server which sets up a PlayerEntity for them
 * 2. User can tap directly on screen to control their character
 * 3. User can show a QR code on their Echo Show which encodes their PlayerID 
 * 4. User scans the QR code on their phone to load a controller UI w/ their PlayerID
 * 5. Controller connects to server along with the Player ID, server now knows which player to process these inputs for
 */

export class GameRoom extends Room {
    onCreate(options) {
        this.setState(new WorldState());
        this.controllers = {}; //mapping from controller ids to player ids
        this.setupPlayerClientMessageHandlers();
        this.setupControllerClientMessageHandlers();
        this.setSimulationInterval((dt) => this.update(dt));
    }

    setupPlayerClientMessageHandlers() {
        this.onMessage("initPlayer", (client, message) => {
            this.state.players.set(client.sessionId, new PlayerEntity(200, 200));

            console.log("new player", client.sessionId);
        });

        this.onMessage("tapAtPosition", (client, message) => {
            let player = this.state.players.get(client.sessionId);
            if(player !== undefined) {
                player.setTargetPosition(message.x, message.y);
            }
        });
    }

    setupControllerClientMessageHandlers() {
        this.onMessage("initController", (client, message) => {
            let player = this.state.players.get(message.playerId);
            if(player !== undefined) {
                this.controllers[client.sessionId] = {"client":client, "playerId": message.playerId};
                client.send("controllerInitialized", {});

                console.log(client.sessionId, " is controller for player", message.playerId);
            }
            else {
                client.send("invalidPlayer", {});
            }
        });

        this.onMessage("startControllerInput", (client, message) => {
            let player = this.getPlayerForController(client.sessionId);
            if(player !== undefined) {
                player.startControllerInput(message.direction);
            }
        });
        this.onMessage("stopControllerInput", (client, message) => {
            let player = this.getPlayerForController(client.sessionId);
            if(player !== undefined) {
                player.stopControllerInput();
            }
        });
    }

    getPlayerForController(controllerId) {
        let playerId = this.controllers[controllerId].playerId;
        return this.state.players.get(playerId);``
    }

    onJoin(client, options) {
        console.log("new connection: ", client.id);
    }

    onLeave(client, options) {
        if(this.state.players.get(client.sessionId) !== undefined) {
            this.state.players.delete(client.sessionId);
        }

        else if(this.controllers[client.sessionId] !== undefined) {
            delete this.controllers[client.sessionId];
        }
    }

    update (dt) {
        this.state.players.forEach((player, playerId) => {
            player.update(dt);
        });
    }
}