import { colors } from '../util/colors.ts';

export class Rect {
    x: number;
    y: number;
    w: number;
    h: number;
    facing: "left" | "right";
    color?: number[];
    texture?: string;
    variant: number;
    collision: boolean;

    constructor(x: number, y: number, w: number, h: number, color?: string, texture?: string, facing: "left" | "right" = "right", variant: number = 0, collision: boolean = true) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.facing = facing;
        this.color = colors[color as keyof typeof colors];
        this.texture = texture;
        this.variant = variant;
        this.collision = collision;
    }
    moveTo(x: number, y: number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }

    move(x: number, y: number) {
        this.x = Math.floor(this.x + x);
        this.y = Math.floor(this.y + y);
    }

    getTilePosition(): [number, number] {
        const centerX = this.x + this.w/2;
        const centerY = this.y + this.h/2;
        return [Math.floor(centerX / 64), Math.floor(centerY / 64)];
    }
}
