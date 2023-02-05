import { Schema, defineTypes } from "@colyseus/schema";
import Entity from "./Entity.js";

export class PlayerEntity extends Entity {
    constructor(x, y) {
        super(x, y);
        this.moving = false;
        this._targetDistance = 0;
        this._receivingActionsFromController = false;
        this._SPEED = .1;
    }

    update(dt) {
        //if the controller is sending inputs or the player had set a target, then calculate movement
        if(this._receivingActionsFromController > 0 || this._targetDistance > 0) {
            let distanceToTravel = this._SPEED * dt;
            if(!this._receivingActionsFromController && distanceToTravel > this._targetDistance) {
                distanceToTravel = this._targetDistance;
            }
            this.x += Math.cos(this.direction) * distanceToTravel;
            this.y += Math.sin(this.direction) * distanceToTravel;
            this._targetDistance -= distanceToTravel;
            this.moving = true;
        }
        else {
            this.moving = false;
        }
    }

    setTargetPosition(x, y) {
        let xDiff = x - this.x;
        let yDiff = y - this.y;
        this.direction = Math.atan2(yDiff, xDiff);
        this._targetDistance = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
    }
    
    startControllerInput(direction) {
        this.direction = direction;
        this._receivingActionsFromController = true;
        this._targetDistance = 0;
    }

    stopControllerInput() {
        this._receivingActionsFromController = false;
        this._targetDistance = 0;
    }
}

defineTypes(PlayerEntity, {
    moving: "boolean"
});