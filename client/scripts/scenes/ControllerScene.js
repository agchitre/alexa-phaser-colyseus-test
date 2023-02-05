import { client } from "../networking.js";

const MAX_DRAG_RADIUS = 80;
export default class ControllerScene extends Phaser.Scene {
    init(data) {
        this.playerIdForController = data.playerIdForController;
    }

    preload() {
    }

    create() {
        this.cameras.main.centerOn(0,0);
        client.joinOrCreate("gameRoom", {}).then(room => {
            this.room = room;
            
            if(this.playerIdForController !== null) {
                this.room.onMessage("controllerInitialized", message => {
                    this.setupController();
                });

                this.room.onMessage("invalidPlayer", message => {
                    alert("not a valid player id");
                });

                this.room.send("initController", {playerId: this.playerIdForController});
            }
          }).catch(e => {
            console.error("join error", e);
          });
    }

    setupController() {        
        this.drawJoypad();

        this.input.setPollAlways();
        this.input.on('pointerdown', function(pointer){
            //track where the dragging began, we'll use this to calculate direction later
            this.dragStartPosition = {x:pointer.worldX, y:pointer.worldY};

            //move the joypad to where the finger started touching
            this.setJoypadPosition(pointer.worldX, pointer.worldY);
        }, this);

        this.input.on('pointerup', function(pointer){
            this.dragStartPosition = undefined;

            //let the server know we're no longer sending inputs
            this.room.send("stopControllerInput", {});

            //move the joypad back to the center of the screen
            this.setJoypadPosition(0, 0);
        }, this);
    }

    update() {
        //if the finger is currently dragging, we should send updates to the server
        if(this.dragStartPosition !== undefined) {
            //get current coordinates of the finger
            let pointer = this.input.activePointer;
            pointer.updateWorldPoint(this.cameras.main);

            //calculate the angle between where the drag began and where the finger is currently
            let xDrag = pointer.worldX - this.dragStartPosition.x;
            let yDrag = pointer.worldY - this.dragStartPosition.y;
            let dragDirection = Math.atan2(yDrag, xDrag);

            //send the direction off to the server
            this.room.send("startControllerInput", {direction: dragDirection});

            //move the nub to match where the finger is
            this.updateJoypadNubPosition(pointer.worldX, pointer.worldY, dragDirection);
        
        }
    }

    /*** Drawing helper functions ***/
    drawJoypad() {
        //draw a bigger, darker circle to represent the base
        this.joypadBase = this.add.circle(0, 0, MAX_DRAG_RADIUS, 0x808080);
        this.joypadBase.setOrigin(.5, .5);

        //draw a smaller, lighter circle to represent the nub
        this.joypadNub = this.add.circle(0, 0, MAX_DRAG_RADIUS/2, 0xffffff);
        this.joypadNub.setOrigin(.5, .5);
    }

    setJoypadPosition(x, y) {
        this.joypadBase.x = x;
        this.joypadBase.y = y;
        this.joypadNub.x = x;
        this.joypadNub.y = y;
    }

    updateJoypadNubPosition(x, y, dragDirection) {
        this.joypadNub.x = x;
        this.joypadNub.y = y;

        //don't let joypad nub drag past edge of joypad radius
        let dragDistance = Phaser.Math.Distance.Between(this.dragStartPosition.x, this.dragStartPosition.y, x, y);
        if(dragDistance > MAX_DRAG_RADIUS) {
            this.joypadNub.x = this.dragStartPosition.x + Math.cos(dragDirection) * MAX_DRAG_RADIUS;
            this.joypadNub.y = this.dragStartPosition.y + Math.sin(dragDirection) * MAX_DRAG_RADIUS;
        }
    }
}