export default class Entity {
    constructor(scene, serverEntity) {
        this.scene = scene;

        /* server coordinates that represent the true position of the entity */
        this.serverX = serverEntity.x;
        this.serverY = serverEntity.y;
        
        /* the orientation that the entity is facing */
        this.direction = serverEntity.direction;

        /* local coordinates that are used for rendering purposes */
        this.x = serverEntity.x;
        this.y = serverEntity.y;
    }

    //called whenever we receive new updates from the server
    onChange(serverEntity) {
        this.serverX = serverEntity.x;
        this.serverY = serverEntity.y;
        this.direction = serverEntity.direction;
    }

    //called by the local render loop
    localUpdate(dt) {
        //interpolate between local position and true server position to avoid choppy movement
        this.x = (this.x + this.serverX) / 2;
        this.y = (this.y + this.serverY) / 2;
    }
}