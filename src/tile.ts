import {VisualRect} from "./visualRect.ts";

export class Tile extends VisualRect {
    collision: boolean;

    constructor(col: number, row: number, w: number = 1, h: number = 1, color?: string, texture?: string, facing: "left" | "right" = "right", variant: number = 0, collision: boolean = true) {
        const tileSize = 64;
        super(col * tileSize, row * tileSize, w * tileSize, h * tileSize, color, texture, facing, variant);
        this.collision = collision;
    }
}