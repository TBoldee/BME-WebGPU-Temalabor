import {Rect} from "./rect.ts";

export class Player extends Rect {
    falling: boolean;
    jumping: boolean;

    constructor(x: number, y: number) {
        super(x,y,20,60);
        this.falling = false;
        this.jumping = false;
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}