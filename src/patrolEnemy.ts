import {Enemy} from "./enemy.ts";
import type {Level} from "./level.ts";

type enemyProps = {
    startCol: number,
    startRow: number,
    endCol: number,
    endRow: number,
    patrolDuration?: number,
    shootingDirection?: "none" | "left" | "right" | "up" | "down",
    shootingInterval?: number,
    shootingDelay?: number,
}

export class PatrolEnemy extends Enemy {
    private endX: number;
    private endY: number;
    private patrolDuration: number;
    private direction: "forward" | "backward";
    private shootingDirection: "none" | "left" | "right" | "up" | "down";
    private shootingInterval: number;
    private tickSinceLastShot: number;
    private shootingDelay: number;
    private level: Level;

    constructor({startCol, startRow, endCol, endRow, patrolDuration = 1, shootingDirection = "none", shootingInterval = 0, shootingDelay = 0}: enemyProps) {
        super(startCol, startRow, 1, 1, "red", "demon", (startCol <= endCol) ? "right" : "left");
        this.startX = startCol * 64;
        this.startY = startRow * 64;
        this.endX = endCol * 64;
        this.endY = endRow * 64;
        this.patrolDuration = patrolDuration === 0 ? 1 : patrolDuration;
        this.horizontalSpeed = (endCol - startCol) / patrolDuration;
        this.verticalSpeed = (endRow - startRow) / patrolDuration;
        this.direction = "forward";
        this.shootingDirection = shootingDirection;
        this.shootingInterval = shootingInterval;
        this.tickSinceLastShot = -shootingDelay;
        this.shootingDelay = shootingDelay
    }

    tick(): void{
        if (this.tickSinceLastShot >= this.shootingInterval){
            this.shoot()
            this.clearTimer()
        }
        this.tickSinceLastShot++
    }

    moveTowardsGoal(){
        this.move(this.horizontalSpeed, this.verticalSpeed);
        const passedGoalForward = (this.direction === "forward" &&
            ((this.startX < this.endX && this.x >= this.endX) || (this.startX > this.endX && this.x <= this.endX) ||
                (this.startY < this.endY && this.y >= this.endY) || (this.startY > this.endY && this.y <= this.endY)));
        const passedGoalBackward = (this.direction === "backward" &&
            ((this.startX < this.endX && this.x <= this.startX) || (this.startX > this.endX && this.x >= this.startX) ||
                (this.startY < this.endY && this.y <= this.startY) || (this.startY > this.endY && this.y >= this.startY)))
        if (passedGoalForward || passedGoalBackward) {
            if (this.horizontalSpeed !== 0 ){
                this.horizontalSpeed *= -1;
                if (this.horizontalSpeed < 0) this.facing = "left";
                else this.facing = "right";
            }
            this.verticalSpeed *= -1;
            if (this.direction === "forward") {
                this.direction = "backward";
                this.x = this.endX;
                this.y = this.endY;
            } else {
                this.direction = "forward";
                this.x = this.startX;
                this.y = this.startY;
            }
        }
    }

    reset(){
        this.direction = "forward";
        this.horizontalSpeed = (this.endX - this.startX) / this.patrolDuration;
        this.verticalSpeed = (this.endY - this.startY) / this.patrolDuration;
        this.moveTo(this.startX, this.startY);
        this.tickSinceLastShot = -this.shootingDelay;
    }

    clearTimer(){
        this.tickSinceLastShot = 0;
    }

    setLevel(level: Level){
        this.level = level;
    }

    shoot(){
        if (this.shootingDirection == "none") return
        const projectileW = 32;
        const projectileH = 32;
        let projectileX, projectileY;
        let hSpeed = 0;
        let vSpeed = 0;
        if (this.shootingDirection === "left"){
            projectileX = this.x - projectileW;
            projectileY = this.y + (this.h - projectileH)/2;
            hSpeed = -5;
        } else if (this.shootingDirection === "right") {
            projectileX = this.x + this.w;
            projectileY = this.y + (this.h - projectileH)/2;
            hSpeed = 5;
        } else if (this.shootingDirection === "up"){
            projectileX = this.x + (this.w - projectileW)/2;
            projectileY = this.y - projectileH;
            vSpeed = -5;
        } else if (this.shootingDirection === "down"){
            projectileX = this.x + (this.w - projectileW)/2;
            projectileY = this.y + this.h;
            vSpeed = 5;
        }
        this.level.spawnProjectile(projectileX, projectileY, projectileW, projectileH, hSpeed, vSpeed);
    }
}