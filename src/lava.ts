import {Hazard} from "./hazard.ts";

export class Lava extends Hazard {

    constructor(col: number, row: number, w: number, h: number, texture: string = "lava") {
        const tileSize = 64;
        super(col * tileSize, row * tileSize, w * tileSize, h * tileSize, "red", texture);
    }
}

export class Spike extends Hazard {
    constructor(col: number, row: number, w: number, h: number) {
        const tileSize = 64;
        super(col * tileSize, row * tileSize, w * tileSize, h * tileSize, "green", "spike");
    }
}