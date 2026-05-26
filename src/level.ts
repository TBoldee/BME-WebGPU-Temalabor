import {Player} from "./player.ts";
import {Rect} from "./rect.ts";
import {Lava, Spike} from "./lava.ts";
import {PatrolEnemy} from "./patrolEnemy.ts"
import {ChasingEnemy} from "./chasingEnemy.ts";
import {Tile} from "./tile.ts";
import {Goal} from "./goal.ts";
import {VisualRect} from "./visualRect.ts";
import {Projectile} from "./projectile.ts";
import {Physics} from "./physics.ts";

export class Level {
    tiles: Tile[][];
    lava: Lava[];
    patrolEnemies: PatrolEnemy[];
    projectiles: Projectile[];
    chasers: ChasingEnemy[];
    goal: Goal;
    player: Player;
    background: VisualRect;
    gravity: number;
    static hasWon: boolean = false;
    static currentLevelIndex: number = 0;
    static levelChanged: boolean = false;
    static levels: Level[] = [];

    constructor(layoutString: string, enemies: PatrolEnemy[], backgroundColor: string, gravity: number = 2) {
        const w = 1;
        const h = 1;
        this.tiles = [];
        for (let i = 0; i < 14; i++) {this.tiles.push([]);}
        this.chasers = [];
        this.lava = [];
        this.projectiles = [];

        let tileStringArray = layoutString.match(/\S/g) ?? [];

        for (let i = 0; i < tileStringArray.length; i++) {
            let str = tileStringArray[i];
            const row = Math.floor(i / 14);
            const col = i % 14;
            if (col === 0) this.tiles[row].push(new Tile(col-1, row, w, h, "transparent")) // Blocker tile on left side
            if (str === "_") {
              this.tiles[row].push(new Tile(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
            } else if (str === "B"){
                this.tiles[row].push(new Tile(col, row, w, h, "red", "bricks"));
            } else if (str === "S"){
                this.tiles[row].push(new Tile(col, row, w, h, "brown", "bones"));
            } else if (str === "C") {
                this.tiles[row].push(new Tile(col, row, w, h, "blue", "cage"));
            } else if (str === "G") {
                this.tiles[row].push(new Tile(col, row, w, h, "green", "grass"));
            } else if (str === "L"){
                this.tiles[row].push(new Tile(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
                this.lava.push(new Lava(col, row, w, h));
            } else if (str === "X"){
                this.tiles[row].push(new Tile(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
                this.lava.push(new Spike(col, row, w, h));
            } else if (str === "D") {
                this.tiles[row].push(new Tile(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
                this.chasers.push(new ChasingEnemy(col, row))
            } else if (str === "+"){
                this.player = new Player(col, row);
                this.tiles[row].push(new Tile(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
            } else if (str === "#" || str === "T"){
                const texture = str === "#" ? "door" : "grave";
                this.goal = new Goal(col, row, texture);
                this.tiles[row].push(new Tile(0, 0, 0, 0, "transparent", undefined, "right", 0, false));
            }
            if (col === 13) this.tiles[row].push(new Tile(col+1, row, w, h, "transparent")) //Blocker tile on right side
        }
        this.setTileVariants();
        this.patrolEnemies = enemies;
        for (const enemy of this.patrolEnemies) {
            enemy.setLevel(this)
        }
        for (const chaser of this.chasers) {
            chaser.setTiles(this.tiles);
            chaser.setPlayer(this.player);
        }
        this.background = new VisualRect(0,0,896,896,backgroundColor);
        this.gravity = gravity;
    }

    public static getCurrentLevel(): Level {
        return Level.levels[Level.currentLevelIndex];
    }

    finish(){
        if (Level.levels.length > Level.currentLevelIndex + 1) {
            Level.levels[++Level.currentLevelIndex].start();
        } else Level.hasWon = true;
    }

    start() {
        this.player.kill()
        this.patrolEnemies.forEach(enemy => enemy.reset());
        this.chasers.forEach(chaser => chaser.reset());
        this.projectiles = [];
        Level.levelChanged = true;
    }

    static restartGame(){
        Level.currentLevelIndex = 0;
        this.hasWon = false;
        Level.levels[Level.currentLevelIndex].start();
    }

    tick(): void {
        if (Physics.checkGoal(this)) this.finish()
        for (const patrolEnemy of this.patrolEnemies) {
            patrolEnemy.tick();
        }
        for (const chaser of this.chasers) {
            chaser.tick();
        }
    }

    physicsUpdate(): void{
        for (const patrolEnemy of this.patrolEnemies) {
            patrolEnemy.moveTowardsGoal();
        }
        for (const chaser of this.chasers) {
            chaser.moveTowardsGoal();
        }
        for (const projectile of this.projectiles) {
            projectile.applySpeed()
        }
    }

    getStaticRectsToRender(): VisualRect[] {
        let rects: VisualRect[] = [];
        rects.push(this.background);
        rects.push(...(this.tiles.flat()));
        rects.push(...this.lava);
        rects.push(this.goal);
        return rects;
    }

    getDynamicRectsToRender(): VisualRect[] {
        let rects: VisualRect[] = [];
        rects.push(this.player);
        rects.push(...this.patrolEnemies);
        rects.push(...this.chasers);
        rects.push(...this.projectiles)
        return rects;
    }

    getRectsForCollision(): Rect[] {
        let rcts: Rect[] = [];
        rcts.push(...(this.tiles.flat().filter(r => r.collision)));
        rcts.push(...this.lava);
        return rcts;
    }

    getRectsWithoutLavaForCollision(): Rect[]{
        let rects: Rect[] = [];
        rects.push(...(this.tiles.flat().filter(r => r.collision)));
        return rects;
    }

    getHazards(): Rect[]{
        let hazards: Rect[] = [];
        hazards.push(...this.lava, ...this.patrolEnemies, ...this.projectiles, ...this.chasers);
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

    spawnProjectile(x: number, y: number, w: number, h: number, horSpeed: number, vertSpeed: number): void {
        this.projectiles.push(new Projectile(x, y, w, h, horSpeed, vertSpeed))
    }

    private setTileVariants(): void {
        for (let row: number = 0; row < this.tiles.length; row++ ) {
            for (let col: number = 0; col < this.tiles[row].length; col++) {
                let currentTile = this.tiles[row][col];
                if (!currentTile.texture?.match(/bricks|grass/)) continue;
                let bitmask: number = 0;
                if (row > 0) if (this.tiles[row-1][col].texture === currentTile.texture) bitmask |= 1;
                if (col > 0) if (this.tiles[row][col-1].texture === currentTile.texture) bitmask |= 2;
                if (col < this.tiles[row].length-1) if (this.tiles[row][col+1].texture === currentTile.texture) bitmask |= 4;
                if (row < this.tiles.length-1) if (this.tiles[row+1][col].texture === currentTile.texture) bitmask |= 8;
                currentTile.variant = bitmask;
            }
        }
    }

    static init (){
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
                new PatrolEnemy({startCol: 1, startRow: 2, endCol: 12, endRow: 2, patrolDuration: 90, shootingDirection: "down", shootingInterval: 10})
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
                new PatrolEnemy({startCol: 2, startRow: 3, endCol: 2, endRow: 12, patrolDuration: 120, shootingDirection: "none"}),
                new PatrolEnemy({startCol: 2, startRow: 12, endCol: 2, endRow: 3, patrolDuration: 80, shootingDirection: "none"}),
                new PatrolEnemy({startCol: 9, startRow: 5, endCol: 12, endRow: 5, patrolDuration: 40, shootingDirection: "none"}),
                new PatrolEnemy({startCol: 9, startRow: 8, endCol: 12, endRow: 8, patrolDuration: 35, shootingDirection: "none"}),
                new PatrolEnemy({startCol: 10, startRow: 7, endCol: 12, endRow: 11, patrolDuration: 45, shootingDirection: "none"}),
                new PatrolEnemy({startCol: 9, startRow: 6, endCol: 11, endRow: 3, patrolDuration: 50, shootingDirection: "none"}),
                new PatrolEnemy({startCol: 4, startRow: 8, endCol: 4, endRow: 8, shootingDirection: "right", shootingInterval: 30}),
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
                new PatrolEnemy({startCol: 4, startRow: 2, endCol: 4, endRow: 2, shootingDirection: "down", shootingInterval: 40}),
                new PatrolEnemy({startCol: 8, startRow: 2, endCol: 8, endRow: 2, shootingDirection: "down", shootingInterval: 40}),
                new PatrolEnemy({startCol: 0, startRow: 3, endCol: 0, endRow: 3, shootingDirection: "right", shootingInterval: 60, shootingDelay: 30}),
                new PatrolEnemy({startCol: 0, startRow: 4, endCol: 0, endRow: 4, shootingDirection: "right", shootingInterval: 60}),
                new PatrolEnemy({startCol: 13, startRow: 12, endCol: 13, endRow: 12, shootingDirection: "left", shootingInterval: 30}),
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
                new PatrolEnemy({startCol: 13, startRow: 1.5, endCol: 13, endRow: 1.5, shootingDirection: "left", shootingInterval: 20}),
                new PatrolEnemy({startCol: 0, startRow: 6, endCol: 0, endRow: 6, shootingDirection: "right", shootingInterval: 36}),
                new PatrolEnemy({startCol: 13, startRow: 12, endCol: 13, endRow: 12, shootingDirection: "left", shootingInterval: 50}),
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

        Level.levels.push(levelOne, levelTwo, levelThree, levelFour, levelFive, levelSix, levelSeven, levelEight, levelNine, levelTen);
    }

}




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