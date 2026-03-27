import {Rect} from "./rect.ts";

export class Spike extends Rect {

    constructor(x: number, y: number, w: number, h: number) {
        super(x, y, w, h, "red");
    }
}