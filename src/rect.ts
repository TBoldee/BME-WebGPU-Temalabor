import { colors } from '../util/colors.ts';

export class Rect {
    x: number;
    y: number;
    w: number;
    h: number;
    facing: "left" | "right";
    color?: number[];
    texture?: string;

    constructor(x: number, y: number, w: number, h: number, color?: string, texture?: string, facing: "left" | "right" = "right") {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.facing = facing;
        this.color = colors[color as keyof typeof colors];
        this.texture = texture;
    }
    moveTo(x: number, y: number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }

    move(x: number, y: number) {
        this.x = Math.floor(this.x + x);
        this.y = Math.floor(this.y + y);
    }
}
