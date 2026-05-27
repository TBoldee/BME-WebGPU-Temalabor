import {Rect} from "./rect.ts";
import {colors} from "../util/colors.ts";

export class VisualRect extends Rect {
    facing: "left" | "right";
    color?: number[];
    texture?: string;
    variant: number;

    constructor(x: number, y: number, w: number, h: number, color?: string, texture?: string, facing: "left" | "right" = "right", variant: number = 0) {
        super(x,y,w,h)
        this.facing = facing;
        this.color = colors[color as keyof typeof colors];
        this.texture = texture;
        this.variant = variant;
    }
}