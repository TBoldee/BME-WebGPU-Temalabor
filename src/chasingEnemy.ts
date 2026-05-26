import type {Player} from "./player.ts";
import {VisualRect} from "./visualRect.ts";
import type {Tile} from "./tile.ts";

type coords = [number, number];

export class ChasingEnemy extends VisualRect {
    tiles: Tile[][];
    player: Player;
    private startX: number;
    private startY: number;
    private currentGoal: coords;
    private horizontalSpeed: number;
    private verticalSpeed: number;

    constructor(x: number, y: number) {
        super(x * 64,y * 64, 64, 64, "red", "beholder");
        this.startX = x * 64;
        this.startY = y * 64;
        this.horizontalSpeed = 0;
        this.verticalSpeed = 0;
        this.currentGoal = undefined;
    }

    setPlayer(player: Player): void {
        this.player = player;
    }
    setTiles(tiles: Tile[][]): void {
        this.tiles = tiles;
    }

    move(){
        let path;
        if (!this.currentGoal) {
            const tileSize = 64;
            path = this.aStar();
            if (path.length === 0) return;
            this.currentGoal = [(path[0][1]-1) * tileSize, path[0][0] * tileSize];
        }
        if (this.horizontalSpeed === 0 && this.verticalSpeed === 0) this.setSpeedForGoal();

        if (this.horizontalSpeed < 0){
            if (this.x + this.horizontalSpeed <= this.currentGoal[0]) {
                this.moveTo(this.currentGoal[0], this.y)
                this.horizontalSpeed = 0;
                this.currentGoal = undefined;
                return;
            }
        } else if (this.horizontalSpeed > 0){
            if (this.x + this.horizontalSpeed >= this.currentGoal[0]) {
                this.moveTo(this.currentGoal[0], this.y)
                this.horizontalSpeed = 0;
                this.currentGoal = undefined;
                return;
            }
        } else if (this.verticalSpeed < 0){
            if (this.y + this.verticalSpeed <= this.currentGoal[1]) {
                this.moveTo(this.x, this.currentGoal[1])
                this.verticalSpeed = 0;
                this.currentGoal = undefined;
                return;
            }
        } else if (this.verticalSpeed > 0){
            if (this.y + this.verticalSpeed >= this.currentGoal[1]) {
                this.moveTo(this.x, this.currentGoal[1])
                this.verticalSpeed = 0;
                this.currentGoal = undefined;
                return;
            }
        }
        this.x += this.horizontalSpeed;
        this.y += this.verticalSpeed;
    }

    private aStar(){
        const [startC, startR] = this.getTilePosition();
        const [playerC, playerR] = this.player.getTilePosition();

        const openList: coords[] = [[startR, startC]]
        const cameFrom = new Map<string, coords>();
        const gScore = new Map<string, number>();
        const fScore = new Map<string, number>();

        gScore.set(this.getKey(startR, startC), 0);
        fScore.set(this.getKey(startR, startC), this.getHeuristic(startR,startC,playerR,playerC));

        const neighborCoordDiffs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        while (openList.length > 0) {
            let bestIndex = 0;
            let bestF = Infinity;
            for (let i = 0; i < openList.length; i++) {
                const [r, c] = openList[i];
                const f = fScore.get(this.getKey(r, c)) ?? Infinity;
                if (f < bestF) {
                    bestF = f;
                    bestIndex = i;
                }
            }

            const current = openList.splice(bestIndex, 1)[0];
            const [currentRow, currentCol] = current;

            if (currentRow === playerR && currentCol === playerC) {
                return this.reconstructPath(cameFrom, current);
            }

            for (const [rowDiff, columnDiff] of neighborCoordDiffs) {
                const neighborRow = currentRow + rowDiff;
                const neighborColumn = currentCol + columnDiff;

                if (!this.coordinatesInBounds(neighborRow, neighborColumn)) continue;
                if (this.isImpassable(neighborRow, neighborColumn)) continue;

                const currentKey = this.getKey(currentRow, currentCol);
                const neighborKey = this.getKey(neighborRow, neighborColumn);

                const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;

                if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
                    cameFrom.set(neighborKey, [currentRow, currentCol]);
                    gScore.set(neighborKey, tentativeG);
                    fScore.set(neighborKey, tentativeG + this.getHeuristic(neighborRow, neighborColumn, playerR, playerC));

                    if (!openList.some(([r, c]) => r === neighborRow && c === neighborColumn)) {
                        openList.push([neighborRow, neighborColumn]);
                    }
                }
            }
        }

        return [];
    }

    private getHeuristic(startR: number, startC: number, goalR: number, goalC: number): number {
        return Math.abs(startR - goalR) + Math.abs(startC - goalC);
    }

    private coordinatesInBounds(row: number, col: number): boolean {
        return row >= 0 && row < this.tiles.length && col >= 1 && col < this.tiles[row]?.length-1;
    }

    private isImpassable(row: number, col: number): boolean {
        return this.tiles[row][col].collision;
    }

    private getKey (row: number, col: number): string {
        return `${row}-${col}`;
    }

    private reconstructPath(cameFrom: Map<string, coords>, current: coords): coords[] {
        const path: coords[] = [current];

        let cur = current;
        while (cameFrom.has(this.getKey(cur[0], cur[1]))) {
            const prev = cameFrom.get(this.getKey(cur[0], cur[1]));
            path.push(prev);
            cur = prev;
        }

        path.reverse();
        path.splice(0,1);
        return path;
    }

    private setSpeedForGoal(): void {
        const speed = 5;
        if (this.currentGoal[0] < this.x) this.horizontalSpeed = -speed;
        else if (this.currentGoal[0] > this.x) this.horizontalSpeed = speed;
        else if (this.currentGoal[1] > this.y) this.verticalSpeed = speed;
        else if (this.currentGoal[1] < this.y) this.verticalSpeed = -speed;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.horizontalSpeed = 0;
        this.verticalSpeed = 0;
        this.currentGoal = undefined;
    }
}