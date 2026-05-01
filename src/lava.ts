import {Rect} from "./rect.ts";

export class Lava extends Rect {

    constructor(x: number, y: number, w: number, h: number) {
        super(x, y, w, h, "red", "lava");
    }
}