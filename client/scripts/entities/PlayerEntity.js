import Entity from "./Entity.js";

export default class PlayerEntity extends Entity {
    constructor(scene, serverEntity) {
        super(scene, serverEntity);

        this.moving = serverEntity.moving;

        this.sprite = this.scene.add.sprite(this.x, this.y, "robot");
    }

    onChange(serverEntity) {
        super.onChange(serverEntity);
        this.moving = serverEntity.moving;
    }

    localUpdate(dt) {
        super.localUpdate(dt);

        //draw the sprite at the locally cached position
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.depth = this.y;

        //flip the orientation of the sprite based on whether it's facing right or left
        this.sprite.scaleX = Math.cos(this.direction) < 0 ? -1 : 1;

        this.sprite.play((this.moving ? "walk" : "idle"), true);
    }

    destroy() {
        this.sprite.destroy();
    }
}