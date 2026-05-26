import {VisualRect} from "./visualRect.ts";

export class Goal extends VisualRect {

    constructor(x: number, y: number, w: number, h: number, texture: "door" | "grave") {
        super(x ,y , w, h, "brown", texture);
    }
}