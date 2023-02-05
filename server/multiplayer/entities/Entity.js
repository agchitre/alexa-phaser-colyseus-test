import { Schema, defineTypes } from "@colyseus/schema";

export default class Entity extends Schema {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.direction = Math.PI *3/2;
    }
}

defineTypes(Entity, {
    x: "number",
    y: "number",
    direction: "number",
});