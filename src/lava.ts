import {Hazard} from "./hazard.ts";

export class Lava extends Hazard {

    constructor(x: number, y: number, w: number, h: number, texture: string = "lava") {
        super(x, y, w, h, "red", texture);
    }
}

export class Spike extends Hazard {
    constructor(x: number, y: number, w: number, h: number) {
        super(x, y, w, h, "green", "spike");
    }
}