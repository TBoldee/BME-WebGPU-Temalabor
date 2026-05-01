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

    constructor(layoutString: string, enemies: Enemy[], backgroundColor: string, gravity: number = 2) {
        const w = 64;
        const h = 64;
        const doorW = 32;
        const doorH = 64;
        const playerW = 32;
        const playerH = 64;
        this.rects = [];
        for (let i = 0; i < 14; i++) {this.rects.push([]);}
        this.lava = [];

        let tileStringArray = layoutString.match(/\S/g) ?? [];

        for (let i = 0; i < tileStringArray.length; i++) {
            let str = tileStringArray[i];
            if (str === "_") continue;
            const row = Math.floor(i / 14);
            const col = i % 14;
            const x = col * w;
            const y = row * h;
            if (str === "B"){
                this.rects[row].push(new Rect(x, y, w, h, "red", "bricks", (i%4 == 0) ? "right" : "left"));
            } else if (str === "S"){
                this.rects[row].push(new Rect(x, y, w, h, "brown", "bones"));
            } else if (str === "L"){
                this.lava.push(new Lava(x, y, w, h));
            } else if (str === "+"){
                this.startX = x + (w-playerW)/2;
                this.startY = y + h - playerH;
                this.player = new Player(this.startX, this.startY);
            } else if (str === "#"){
                this.goal = new Rect(x + (w-doorW)/2, y + h - doorH, doorW, doorH, "brown", "door");
            }
        }
        this.enemies = enemies;
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
    `
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    B____________B
    B____________B
    B____________B
    B__________#_B
    B________BBBBB
    B_+__BBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    `,
    [],
    "indigo"
);

const levelTwo: Level = new Level (
    `
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBB__BBBBBB
    BBBB______BBBB
    B____________B
    B____________B
    B+__________#B
    BB__SS__SS__BB
    B____________B
    B____________B
    B____________B
    BLLLLLLLLLLLLB
    BSSSSSSSSSSSSB
    BBBBBBBBBBBBBB
    `,
    [],
    "indigo"
);

const levelThree: Level = new Level (
    `
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    B+__________#B
    BB__SS__SS__BB
    B____________B
    B____________B
    B____________B
    BLLLLLLLLLLLLB
    BSSSSSSSSSSSSB
    BBBBBBBBBBBBBB
    `,
    [],
    "indigo"
);

const levelFour: Level = new Level (
    `+`,
    [
        new Enemy(418, 400, 418, 660, 64, 64, 42)
    ],
    "indigo"
);

levels.push(levelOne, levelTwo, levelThree);
