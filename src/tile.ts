import {VisualRect} from "./visualRect.ts";

export class Tile extends VisualRect {
    collision: boolean;

    constructor(x: number, y: number, w: number, h: number, color?: string, texture?: string, facing: "left" | "right" = "right", variant: number = 0, collision: boolean = true) {
        super(x, y, w, h, color, texture, facing, variant);
        this.collision = collision;
    } //TODO itt is tile indexet inkább mint x,y koord
}