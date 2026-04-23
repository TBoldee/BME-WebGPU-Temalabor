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

    getRectsForCollision(): Rect[] {
        let rcts: Rect[] = [];
        rcts.push(...this.rects);
        rcts.push(...this.spikes);
        return rcts;
    }
}

const levels: Level[] = [];

const levelOne: Level = new Level (
    100, 500,
    [
        new Rect(0, -40,900, 448, "orange", "bricks"), //top block
        new Rect(0, 600,900, 300, "orange", "bricks"), //left bottom block
        new Rect(450, 536,450, 64, "orange", "bricks"), //right bottom block
        new Rect(836, 408,64, 128, "orange", "bricks"), //right wall
        new Rect(0, 408,64, 196, "orange", "bricks"), //left wall
    ],
    [],
    new Rect(750, 472, 32, 64,"purple","door"),
    "indigo"
);

const levelTwo: Level = new Level (
    100, 450,
    [
        new Rect(0,    0,   900, 384, "orange", "bricks" ), //top block
        new Rect(64,   576, 100, 64, "orange", "bricks"  ), //spawn platform
        new Rect(250,  576, 150, 64, "orange", "bones", "left" ), //first platform
        new Rect(500,  576, 150, 64, "orange", "bones", "left" ), //second platform
        new Rect(750,  576, 100, 64, "orange", "bricks" ), //third platform
        new Rect(64, 832, 772, 68, "orange", "bones" ), //bottom block
        new Rect(836, 384, 64,  516, "orange", "bricks"), //right wall
        new Rect(0,   384, 64,  516, "orange", "bricks"), //left wall
    ],
    [
        new Spike(64, 768, 772, 64), //bottom spike
    ],
    new Rect( 800, 512, 32, 64,"purple","door"),
    "indigo"
);

const levelThree: Level = new Level (
    100, 512,
    [
        new Rect( 0, 0,    900,  512, "orange", "bricks"), //top block
        new Rect( 64, 576,  100,  64, "orange", "bricks"), //spawn platform
        new Rect( 250, 576,  150,  64, "orange", "bones"), //first platform
        new Rect( 500, 576,  150,  64, "orange", "bones"), //second platform
        new Rect( 750, 576,  100,  64, "orange", "bricks"), //third platform
        new Rect( 64, 832,  772,  68, "orange", "bones"), //bottom block
        new Rect( 836, 384,  64,   516, "orange", "bricks"), //right wall
        new Rect( 0, 384,  64,   516, "orange", "bricks"), //left wall
    ],
    [
        new Spike(64, 768, 772, 64), //bottom spike
    ],
    new Rect( 800, 512, 32, 64,"purple","door"),
    "indigo"
);

const testOne: Level = new Level (
    200, 200,
    [
        new Rect( 0,   800, 900, 100, "orange"),
        new Rect( 0,   0,   50,  900, "orange"),
        new Rect( 850, 0,   50,  900, "orange" ),
        new Rect( 200, 550, 210, 30,  "orange"),
        new Rect( 600, 550, 50,  100,  "orange" ),
        new Rect( 450, 550, 70,  30,  "orange" ),
        new Rect( 380, 460, 30,  60,  "orange" ),
        new Rect( 675, 550, 60,  30,  "orange" ),
        new Rect( 600, 650, 160,  30,  "orange"),
        new Rect( 380, 460, 350, 30,  "orange"),
        new Rect( 120, 700, 150, 30,  "orange"),
        new Rect( 730, 460, 30, 120,  "orange" ),
        new Rect( 100, 620, 50,  30,  "orange" ),
        new Rect( 500, 380, 200, 30,  "orange"),
    ],
    [
        new Spike(840, 460, 30, 5)
    ],
    new Rect( 715, 590, 30, 60,"purple","door"),
    "beige"
);

levels.push(levelOne, levelTwo, levelThree, testOne);
