import {VisualRect} from "./visualRect.ts";

export class Goal extends VisualRect {

    constructor(col: number, row: number, texture: "door" | "grave") {
        const tileSize = 64;
        const goalW = 1/2;
        const goalH = 1;
        const x = col * tileSize + (tileSize - goalW * tileSize)/2;
        const y = (row + 1) * tileSize - goalH * tileSize;
        super(x, y, tileSize * goalW, tileSize * goalH, "brown", texture);
    }
}