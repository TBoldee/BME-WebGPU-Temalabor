import {colors} from '../util/colors.ts';
import {Player} from "./player.ts";
import {Rect} from "./rect.ts";

export class Level {
    rects: Rect[];
    player: Player;
    background: Rect;
    gravity: number;

    constructor(startX: number, startY: number, rects: Rect[], backgroundColor: string, gravity: number = 2) {
        this.rects = rects;
        this.player = new Player(startX, startY);
        this.background = new Rect(0,0,900,900,backgroundColor);
        this.gravity = gravity;
    }

    public static getCurrentLevel(): Level{
        return levels[0];
    }
}

const levels: Level[] = [];

const testLevel: Level = new Level (
        200, 200,
        [{ x: 0,   y: 800, w: 900, h: 100, color: colors["orange"] },
        // left wall
        { x: 0,   y: 0,   w: 50,  h: 900, color: colors["black"] },
        // right wall
        { x: 850, y: 0,   w: 50,  h: 900, color: colors["black"] },
        // platforms
        { x: 200, y: 550, w: 200, h: 30,  color: colors["orange"] },
        { x: 380, y: 475, w: 150, h: 30,  color: colors["orange"] },
        { x: 500, y: 400, w: 200, h: 30,  color: colors["orange"] }],
        "beige"
    );

levels.push(testLevel);
