import {VisualRect} from "./visualRect.ts";

export abstract class Enemy extends VisualRect {
    protected startX: number;
    protected startY: number;
    protected horizontalSpeed: number;
    protected verticalSpeed: number;

    constructor(col: number, row: number, w: number = 1, h: number = 1, color?: string, texture?: string, facing: "left" | "right" = "right", variant: number = 0) {
        super(col * 64, row * 64, w * 64, h * 64, color, texture, facing, variant);
    }

    abstract tick(): void

    abstract moveTowardsGoal(): void

    abstract reset(): void
}