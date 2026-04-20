import {colors} from '../util/colors.ts';
import {Player} from "./player.ts";
import {Rect} from "./rect.ts";
import {Spike} from "./spike.ts";

export class Level {
    rects: Rect[];
    spikes: Spike[];
    goal: Rect;
    player: Player;
    background: Rect;
    startX: number;
    startY: number;
    gravity: number;

    private static currentLevelIndex: number = 0;

    constructor(startX: number, startY: number, rects: Rect[], spikes: Spike[], goal:Rect, backgroundColor: string, gravity: number = 2) {
        this.rects = rects;
        this.spikes = spikes;
        this.startX = startX;
        this.startY = startY;
        this.player = new Player(startX, startY);
        this.goal = goal;
        this.background = new Rect(0,0,900,900,backgroundColor);
        this.gravity = gravity;
    }

    public static getCurrentLevel(): Level{
        return levels[this.currentLevelIndex];
    }

    finish(){
        if (levels.length > Level.currentLevelIndex + 1) {
            levels[++Level.currentLevelIndex].start();
        }
    }

    start() {
        this.player.moveTo(this.startX, this.startY);
    }

    getRectsToRender(): Rect[] {
        let rects: Rect[] = [];
        rects.push(this.background);
        rects.push(...this.rects);
        rects.push(this.player);
        rects.push(...this.spikes);
        rects.push(this.goal);
        return rects;
    }
}

const levels: Level[] = [];

const levelOne: Level = new Level (
    100, 500,
    [
        { x: 0,   y: -40,   w: 900,  h: 448, color: colors["orange"], texture: "bricks" }, //top block
        { x: 0,   y: 600, w: 900, h: 300, color: colors["orange"], texture: "bricks" }, //left bottom block
        { x: 450,   y: 536, w: 450, h: 64, color: colors["orange"], texture: "bricks" }, //right bottom block
        { x: 836, y: 408,   w: 64,  h: 128, color: colors["orange"], texture: "bricks" }, //right wall
        { x: 0, y: 408,   w: 64,  h: 196, color: colors["orange"], texture: "bricks" }, //left wall
    ],
    [],
    { x: 750, y: 472, w: 32, h: 64,  color: colors["purple"], texture: "door" },
    "beige"
);

const levelTwo: Level = new Level (
    100, 450,
    [
        { x: 0,   y: 0,   w: 900, h: 400, color: colors["orange"] }, //top block
        { x: 50,   y: 550, w: 100, h: 50, color: colors["orange"] }, //spawn platform
        { x: 250,   y: 550, w: 150, h: 50, color: colors["orange"] }, //first platform
        { x: 500,   y: 550, w: 150, h: 50, color: colors["orange"] }, //second platform
        { x: 750,   y: 550, w: 100, h: 50, color: colors["orange"] }, //third platform
        { x: 0, y: 800, w: 900, h: 100, color: colors["orange"] }, //bottom block
        { x: 850, y: 400, w: 50,  h: 400, color: colors["orange"] }, //right wall
        { x: 0,   y: 400, w: 50,  h: 400, color: colors["orange"] }, //left wall
    ],
    [
        new Spike(50, 770, 800, 64), //bottom spike
    ],
    { x: 800, y: 490, w: 30, h: 60,  color: colors["purple"] },
    "beige"
);

const testOne: Level = new Level (
    200, 200,
    [{ x: 0,   y: 800, w: 900, h: 100, color: colors["orange"] },
    { x: 0,   y: 0,   w: 50,  h: 900, color: colors["orange"] },
    { x: 850, y: 0,   w: 50,  h: 900, color: colors["orange"] },
    { x: 200, y: 550, w: 210, h: 30,  color: colors["orange"] },
    { x: 600, y: 550, w: 50,  h: 100,  color: colors["orange"] },
    { x: 450, y: 550, w: 70,  h: 30,  color: colors["orange"] },
    { x: 380, y: 460, w: 30,  h: 60,  color: colors["orange"] },
    { x: 840, y: 460, w: 30,  h: 5,  color: colors["orange"] },
    { x: 675, y: 550, w: 60,  h: 30,  color: colors["orange"] },
    { x: 600, y: 650, w: 160,  h: 30,  color: colors["orange"] },
    { x: 380, y: 460, w: 350, h: 30,  color: colors["orange"] },
    { x: 120, y: 700, w: 150, h: 30,  color: colors["orange"] },
    { x: 730, y: 460, w: 30, h: 120,  color: colors["orange"] },
    { x: 100, y: 620, w: 50,  h: 30,  color: colors["orange"] },
    { x: 500, y: 380, w: 200, h: 30,  color: colors["orange"] }],
    [],
    { x: 715, y: 590, w: 30, h: 60,  color: colors["purple"] },
    "beige"
);

const testTwo: Level = new Level (
    200, 200,
    [{ x: 0,   y: 800, w: 900, h: 100, color: colors["yellow"] },
    { x: 0,   y: 0,   w: 50,  h: 900, color: colors["yellow"] },
    { x: 850, y: 0,   w: 50,  h: 900, color: colors["yellow"] },
    { x: 200, y: 550, w: 210, h: 30,  color: colors["yellow"] },
    { x: 600, y: 550, w: 50,  h: 100,  color: colors["yellow"] },
    { x: 450, y: 550, w: 70,  h: 30,  color: colors["yellow"] },
    { x: 380, y: 460, w: 30,  h: 60,  color: colors["yellow"] },
    { x: 840, y: 460, w: 30,  h: 5,  color: colors["yellow"] },
    { x: 675, y: 550, w: 60,  h: 30,  color: colors["yellow"] },
    { x: 600, y: 650, w: 160,  h: 30,  color: colors["yellow"] },
    { x: 380, y: 460, w: 350, h: 30,  color: colors["yellow"] },
    { x: 120, y: 700, w: 150, h: 30,  color: colors["yellow"] },
    { x: 730, y: 460, w: 30, h: 120,  color: colors["yellow"] },
    { x: 100, y: 620, w: 50,  h: 30,  color: colors["yellow"] },
    { x: 500, y: 380, w: 200, h: 30,  color: colors["yellow"] }],
    [],
    { x: 715, y: 590, w: 30, h: 60,  color: colors["purple"] },
    "gray"
);

levels.push( levelOne, levelTwo, testOne, testTwo);
