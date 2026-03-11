import {colors} from '../util/colors.ts';
import {Player} from "./player.ts";

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
        this.h = h
        this.color = colors[color as keyof typeof colors];
    }
}

export class Level {
    rects: Rect[];
    player: Player;
    background: Rect;

    constructor(startX: number, startY: number, rects: Rect[], background: string) {
        this.rects = rects;
        this.player = new Player(startX, startY);
        this.background = new Rect(0,0,900,900,background);
    }
}

export const testLevel: Level = new Level (
        200, 200,
        [{ x: 0,   y: 800, w: 900, h: 100, color: colors["green"] },
        // left wall
        { x: 0,   y: 0,   w: 50,  h: 900, color: colors["black"] },
        // right wall
        { x: 850, y: 0,   w: 50,  h: 900, color: colors["black"] },
        // platforms
        { x: 200, y: 550, w: 200, h: 30,  color: colors["brown"] },
        { x: 500, y: 400, w: 200, h: 30,  color: colors["brown"] }],
        "blue"
    );

