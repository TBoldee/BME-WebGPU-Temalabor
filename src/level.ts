import {Player} from "./player.ts";
import {Rect} from "./rect.ts";
import {Lava, Spike} from "./lava.ts";
import {Enemy} from "./enemy.ts"
import {ChasingEnemy} from "./chasingEnemy.ts";

export class Level {
    rects: Rect[][];
    lava: Lava[];
    enemies: Enemy[];
    chasers: ChasingEnemy[];
    goal: Rect;
    player: Player;
    background: Rect;
    startX: number;
    startY: number;
    gravity: number;
    static hasWon: boolean = false;
    static currentLevelIndex: number = 0;
    static levelChanged: boolean = false;

    constructor(layoutString: string, enemies: Enemy[], backgroundColor: string, gravity: number = 2) {
        const w = 64;
        const h = 64;
        const doorW = 32;
        const doorH = 64;
        const playerW = 24;
        const playerH = 64;
        this.rects = [];
        for (let i = 0; i < 14; i++) {this.rects.push([]);}
        this.chasers = [];
        this.lava = [];

        let tileStringArray = layoutString.match(/\S/g) ?? [];

        for (let i = 0; i < tileStringArray.length; i++) {
            let str = tileStringArray[i];
            const row = Math.floor(i / 14);
            const col = i % 14;
            const x = col * w;
            const y = row * h;
            if (col === 0) this.rects[row].push(new Rect(x - w,y,w,h, "transparent")) // Blocker tile on left side
            if (str === "_") {
              this.rects[row].push(new Rect(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
            } else if (str === "B"){
                this.rects[row].push(new Rect(x, y, w, h, "red", "bricks"));
            } else if (str === "S"){
                this.rects[row].push(new Rect(x, y, w, h, "brown", "bones"));
            } else if (str === "C") {
                this.rects[row].push(new Rect(x, y, w, h, "blue", "cage"));
            } else if (str === "G") {
                this.rects[row].push(new Rect(x, y, w, h, "green", "grass"));
            } else if (str === "L"){
                this.rects[row].push(new Rect(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
                this.lava.push(new Lava(x, y, w, h));
            } else if (str === "X"){
                this.rects[row].push(new Rect(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
                this.lava.push(new Spike(x, y, w, h));
            } else if (str === "D") {
                this.rects[row].push(new Rect(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
                this.chasers.push(new ChasingEnemy(col,row))
            } else if (str === "+"){
                this.startX = x + (w-playerW)/2;
                this.startY = y + h - playerH;
                this.player = new Player(this.startX, this.startY);
                this.rects[row].push(new Rect(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
            } else if (str === "#" || str === "T"){
                const texture = str === "#" ? "door" : "grave";
                this.goal = new Rect(x + (w-doorW)/2, y + h - doorH, doorW, doorH, "brown", texture);
                this.rects[row].push(new Rect(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
            }
            if (col === 13) this.rects[row].push(new Rect(x + w,y,w,h, "transparent")) //Blocker tile on right side
        }
        this.setTileVariants();
        this.enemies = enemies;
        for (const chaser of this.chasers) {
            chaser.setTiles(this.rects);
            chaser.setPlayer(this.player);
        }
        this.background = new Rect(0,0,900,900,backgroundColor);
        this.gravity = gravity;
    }

    public static getCurrentLevel(): Level{
        return levels[Level.currentLevelIndex];
    }

    finish(){
        this.enemies.forEach(enemy => enemy.clearTimer());
        if (levels.length > Level.currentLevelIndex + 1) {
            levels[++Level.currentLevelIndex].start();
        } else Level.hasWon = true;
    }

    start() {
        this.player.moveTo(this.startX, this.startY);
        this.player.stopMoveRight()
        this.player.stopMoveLeft()
        this.enemies.forEach(enemy => enemy.reset());
        this.chasers.forEach(chaser => chaser.reset());
        Level.levelChanged = true;
    }

    static restartGame(){
        console.log("Restarting game...");
        Level.currentLevelIndex = 0;
        for (const level of levels) {
            level.player.kill();
            level.start();
            level.enemies.forEach(enemy => enemy.clearTimer());
        }
        this.hasWon = false;
        levels[Level.currentLevelIndex].start();
    }

    getStaticRectsToRender(): Rect[] {
        let rects: Rect[] = [];
        rects.push(this.background);
        rects.push(...(this.rects.flat()));
        rects.push(...this.lava);
        rects.push(this.goal);
        return rects;
    }

    getDynamicRectsToRender(): Rect[] {
        let rects: Rect[] = [];
        rects.push(this.player);
        rects.push(...this.enemies);
        rects.push(...this.chasers);
        rects.push(...this.getProjectiles())
        return rects;
    }

    getRectsForCollision(): Rect[] {
        let rcts: Rect[] = [];
        rcts.push(...(this.rects.flat().filter(r => r.collision)));
        rcts.push(...this.lava);
        return rcts;
    }

    getRectsWithoutLavaForCollision(): Rect[]{
        let rects: Rect[] = [];
        rects.push(...(this.rects.flat().filter(r => r.collision)));
        return rects;
    }

    getProjectiles(): Rect [] {
        let projectiles: Rect[] = [];
        for (const enemy of this.enemies) {
            projectiles.push(...enemy.bullets)
        }
        return projectiles;
    }

    getHazards(): Rect[]{
        let hazards: Rect[] = [];
        hazards.push(...this.lava, ...this.enemies, ...this.getProjectiles(), ...this.chasers);
        return hazards;
    }

    killPlayerIfOOB(){
        const player = this.player;
        const leftX = 0;
        const rightX = 896;
        const bottomY = 896;
        const topY = 0;
        if (player.x <= leftX - player.w || player.x >= rightX ||
            player.y >= bottomY || player.y <= topY - player.h) {
            player.kill()
            this.start()
        }
    }

    private setTileVariants(): void {
        for (let row: number = 0; row < this.rects.length; row++ ) {
            for (let col: number = 0; col < this.rects[row].length; col++) {
                let currentTile = this.rects[row][col];
                if (!currentTile.texture?.match(/bricks|grass/)) continue;
                let bitmask: number = 0;
                if (row > 0) if (this.rects[row-1][col].texture === currentTile.texture) bitmask |= 1;
                if (col > 0) if (this.rects[row][col-1].texture === currentTile.texture) bitmask |= 2;
                if (col < this.rects[row].length-1) if (this.rects[row][col+1].texture === currentTile.texture) bitmask |= 4;
                if (row < this.rects.length-1) if (this.rects[row+1][col].texture === currentTile.texture) bitmask |= 8;
                currentTile.variant = bitmask;
            }
        }
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
    BC+__BBBBBBSSB
    BBBBBBBSSBBBBB
    BSSSBBBBSSBBBB
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
    BBBBBB__BBBBBB
    BBBB______BBBB
    B____________B
    BCCCCCCCCCCCCB
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
    `
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    B____________B
    B____________B
    BC___C__C___CB
    B____________B
    B+__________#B
    BSSBBSSSSBSSSB
    BSSSSSSSBBSSSB
    BSSBBBSSSSSSSB
    BSBBBBSSBBBSSB
    BSSBBSSSBBBBSB
    BBBBBSSBBBSSSB
    BBBBBBBBBBBBBB
    `,
    [
        new Enemy({x: 1, y: 2, endX: 12, endY: 2, patrolDuration: 90, shootingDirection: "down", shootingInterval: 10})
    ],
    "indigo"
);

const levelFive: Level = new Level (
    `
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBBB
    BBBBBBBBBBBBDB
    BBBBBBBBBBBB_B
    B____________B
    B_BBBBBBBBBBBB
    B_B________BBB
    B_B__________B
    B+B____BLBBB_B
    B___B___B____B
    B__BB___B_BBBB
    B_BBB___B___#B
    BBBBBLLLBBBBBB
    `,
    [],
    "indigo"
);

const levelSix: Level = new Level (
    `
    BBBBBBBBBBBBBB
    B+__B________B
    BBB_B________B
    B___BX__B____B
    B__BB__BB____B
    B___B__XB____B
    BB__BB__B____B
    B___B___B____B
    B__B___BB____B
    BB__B___B____B
    B___BB__B____B
    B__BB__BB____B
    B_______B___#B
    BBLBBBBBBBBBBB
    `,
    [
        new Enemy({x: 2, y: 3, endX: 2, endY: 12, patrolDuration: 120, shootingDirection: "none"}),
        new Enemy({x: 2, y: 12, endX: 2, endY: 3, patrolDuration: 80, shootingDirection: "none"}),
        new Enemy({x: 9, y: 5, endX: 12, endY: 5, patrolDuration: 40, shootingDirection: "none"}),
        new Enemy({x: 9, y: 8, endX: 12, endY: 8, patrolDuration: 35, shootingDirection: "none"}),
        new Enemy({x: 10, y: 7, endX: 12, endY: 11, patrolDuration: 45, shootingDirection: "none"}),
        new Enemy({x: 9, y: 6, endX: 11, endY: 3, patrolDuration: 50, shootingDirection: "none"}),
        new Enemy({x: 4, y: 8, endX: 4, endY: 8, shootingDirection: "right", shootingInterval: 30}),
    ],
    "indigo"
)

const levelSeven: Level = new Level (
    `
    B#_BBBBBB__BBB
    BB___B_______B
    B____B_BXB___B
    B_B__X__X___BB
    B___BB__B__BBB
    B_B_____B____B
    B__BBBBBBBB__B
    B___________BB
    B____BBBBLLBBB
    B____________B
    B__B_________B
    BBBBBBBBBBBB_B
    BD_________X+B
    BBBBBBBBBBBBBB
    `,
    [],
    "indigo"
)

const levelEight: Level = new Level(
    `
    BBBBBBBBBBBBBB
    BLLLBSCSBSB+_B
    BBBB_BBB_BBB_B
    _____________B
    _____________B
    B__BBBBBBBBBBB
    BB__BXXXX____X
    BBB_B________X
    BBB_______BX_X
    BBB_B_____B__X
    BBBLBLLLLBB_BB
    B____________B
    B#____________
    BBBBBBBBBBBBBB
    `,
    [
        new Enemy({x: 4, y: 2, endX: 4, endY: 2, shootingDirection: "down", shootingInterval: 40}),
        new Enemy({x: 8, y: 2, endX: 8, endY: 2, shootingDirection: "down", shootingInterval: 40}),
        new Enemy({x: 0, y: 3, endX: 0, endY: 3, shootingDirection: "right", shootingInterval: 60, shootingDelay: 30}),
        new Enemy({x: 0, y: 4, endX: 0, endY: 4, shootingDirection: "right", shootingInterval: 60}),
        new Enemy({x: 13, y: 12, endX: 13, endY: 12, shootingDirection: "left", shootingInterval: 30}),
    ],
    "indigo"
)

const levelNine: Level = new Level (
    `
    BBBBBBBBBBBBBB
    B_B___________
    B+____________
    BSBBBBBBBBBB__
    B___X__X__X__C
    B____________B
    _____________B
    ___BSBSBBBBBBS
    _BBBSSBBBS#___
    __SBBBSBBSSS__
    B____________B
    B___________BC
    B_____________
    BB__CC__C__BBB
    `,
    [
        new Enemy({x: 13, y: 1.5, endX: 13, endY: 1.5, shootingDirection: "left", shootingInterval: 20}),
        new Enemy({x: 0, y: 6, endX: 0, endY: 6, shootingDirection: "right", shootingInterval: 36}),
        new Enemy({x: 13, y: 12, endX: 13, endY: 12, shootingDirection: "left", shootingInterval: 50}),
    ],
    "indigo"
);

const levelTen: Level = new Level (
    `
    ______________
    ______________
    ______________
    ______________
    ______________
    ______________
    ______________
    ______________
    ___________T__
    ___________G__
    G+__GGGGGGGGGG
    GGGGGGGGGGGGGG
    GGGGGGGGGGGGGG
    GGGGGGGGGGGGGG
    `,
    [],
    "skyblue"
);

levels.push(levelOne, levelTwo, levelThree, levelFour, levelFive, levelSix, levelSeven, levelEight, levelNine, levelTen);


/*
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
BBBBBBBBBBBBBB
 */