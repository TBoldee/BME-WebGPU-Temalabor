import {Player} from "./player.ts";
import {Rect} from "./rect.ts";
import {Lava} from "./lava.ts";
import {Enemy} from "./enemy.ts"

export class Level {
    rects: Rect[][];
    lava: Lava[];
    enemies: Enemy[];
    goal: Rect;
    player: Player;
    background: Rect;
    startX: number;
    startY: number;
    gravity: number;
    static hasWon: boolean = false;
    private static currentLevelIndex: number = 0;

    constructor(startX: number, startY: number, layoutString: string, spikes: Lava[], enemies: Enemy[],
                goal:Rect, backgroundColor: string, gravity: number = 2) {
        const w = 64;
        const h = 64;
        this.rects = [];
        for (let i = 0; i < 14; i++) {this.rects.push([]);}
        this.lava = [];
        let tileStringArray = layoutString.trim().split(/[\n\s]+/);

        for (let i = 0; i < tileStringArray.length; i++) {
            let str = tileStringArray[i];
            if (str === "_") continue;
            const row = Math.floor(i / 14);
            const col = i % 14;
            const x = col * 64;
            const y = row * 64;
            if (str === "B"){
                this.rects[row].push(new Rect(x, y, w, h, "red", "bricks"))
            } else if (str === "S"){
                this.rects[row].push(new Rect(x, y, w, h, "brown", "bones"));
            } else if (str === "L"){
                this.lava.push(new Lava(x, y, w, h));
            }
        }
        this.enemies = enemies;
        this.startX = startX;
        this.startY = startY;
        this.player = new Player(startX, startY);
        this.goal = goal;
        this.background = new Rect(0,0,900,900,backgroundColor);
        this.gravity = gravity;
    }

    public static getCurrentLevel(): Level{
        return levels[Level.currentLevelIndex];
    }

    finish(){
        if (levels.length > Level.currentLevelIndex + 1) {
            levels[++Level.currentLevelIndex].start();
        } else Level.hasWon = true;
    }

    start() {
        this.player.moveTo(this.startX, this.startY);
        this.enemies.forEach(enemy => enemy.reset());
    }

    static restartGame(){
        this.hasWon = false;
        this.currentLevelIndex = 0;
        for (const level of levels) {
            level.player.kill();
        }
        levels[Level.currentLevelIndex].start();
    }

    getRectsToRender(): Rect[] {
        let rects: Rect[] = [];
        rects.push(this.background);
        rects.push(...this.rects.flat());
        rects.push(this.player);
        rects.push(...this.lava);
        rects.push(...this.enemies);
        rects.push(this.goal);
        return rects;
    }

    getRectsForCollision(): Rect[] {
        let rcts: Rect[] = [];
        rcts.push(...this.rects.flat());
        rcts.push(...this.lava);
        return rcts;
    }
}

const levels: Level[] = [];

const levelOne: Level = new Level (
    100, 500,
    `
    B B B B B B B B B B B B B B
    B B B B B B B B B B B B B B
    B B B B B B B B B B B B B B
    B B B B B B B B B B B B B B
    B B B B B B B B B B B B B B
    B _ _ _ _ _ _ _ _ _ _ _ _ B
    B _ _ _ _ _ _ _ _ _ _ _ _ B
    B _ _ _ _ _ _ _ _ _ _ _ _ B
    B _ _ _ _ _ _ _ _ _ _ _ _ B
    B _ _ _ _ _ _ _ _ B B B B B
    B _ _ _ _ B B B B B B B B B
    B B B B B B B B B B B B B B
    B B B B B B B B B B B B B B
    B B B B B B B B B B B B B B
    `,
    [],
    [],
    new Rect(750, 472, 32, 64,"purple","door"),
    "indigo"
);

const levelTwo: Level = new Level (
    100, 450,
    ``,
    [
        new Lava(64, 768, 772, 64), //bottom spike
    ],
    [],
    new Rect( 800, 512, 32, 64,"purple","door"),
    "indigo"
);

const levelThree: Level = new Level (
    100, 512,
    ``,
    [
        new Lava(64, 768, 772, 64), //bottom spike
    ],
    [],
    new Rect( 800, 512, 32, 64,"purple","door"),
    "indigo"
);

const levelFour: Level = new Level (
    100, 500,
    ``,
    [
        new Lava(64, 768, 772, 64), //bottom spike
    ],
    [
        new Enemy(418, 400, 418, 660, 64, 64, 42)
    ],
    new Rect( 800, 512, 32, 64,"purple","door"),
    "indigo"
);

levels.push(levelOne);
//levels.push(levelOne, levelTwo, levelThree, levelFour);
