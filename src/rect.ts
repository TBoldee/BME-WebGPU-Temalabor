import { colors } from '../util/colors.ts';

export class Rect {
    x: number;
    y: number;
    w: number;
    h: number;
    color?: number[];

    constructor(x: number, y: number, w: number, h: number, color?: string) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = colors[color as keyof typeof colors];
    }
}
