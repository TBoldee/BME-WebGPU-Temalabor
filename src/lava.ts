import {Rect} from "./rect.ts";

export class Lava extends Rect {

    constructor(x: number, y: number, w: number, h: number, texture: string = "lava") {
        super(x, y, w, h, "red", texture);
    }
}

export class Spike extends Lava {
    constructor(x: number, y: number, w: number, h: number) {
        super(x,y,w,h, "spike");
    }
}