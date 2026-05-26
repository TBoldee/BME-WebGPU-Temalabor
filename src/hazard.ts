import {VisualRect} from "./visualRect.ts";

export abstract class Hazard extends VisualRect{
    constructor(x: number, y: number, w: number, h: number, color?: string, texture?: string, facing: "left" | "right" = "right", variant: number = 0) {
        super(x, y, w, h, color, texture, facing, variant);
    }
}