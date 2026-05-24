import {Rect} from "./rect.ts";
import {Projectile} from "./projectile.ts";

type enemyProps = {
    x: number,
    y: number,
    endX: number,
    endY: number,
    w?: number,
    h?: number,
    patrolDuration?: number,
    shootingDirection?: "none" | "left" | "right" | "up" | "down",
    shootingInterval?: number,
    shootingDelay?: number,
}

export class Enemy extends Rect {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    horizontalSpeed: number;
    verticalSpeed: number;
    patrolDuration: number;
    direction: "forward" | "backward";
    bullets: Projectile[];
    shootingDirection: "none" | "left" | "right" | "up" | "down";
    shootingInterval: number;
    private tickSinceLastShot: number;
    private shootingDelay: number;
    constructor({x, y, endX, endY, w = 1, h = 1, patrolDuration = 1, shootingDirection = "none", shootingInterval = 0, shootingDelay = 0}: enemyProps) {
        super(x * 64, y * 64, w * 64, h * 64, "red", "demon");
        this.startX = x * 64;
        this.startY = y * 64;
        this.endX = endX * 64;
        this.endY = endY * 64;
        this.patrolDuration = patrolDuration === 0 ? 1 : patrolDuration;
        this.horizontalSpeed = (endX - x) / patrolDuration;
        this.verticalSpeed = (endY - y) / patrolDuration;
        this.direction = "forward";
        this.bullets = [];
        this.shootingDirection = shootingDirection;
        this.shootingInterval = shootingInterval;
        this.tickSinceLastShot = shootingDelay;
        this.shootingDelay = shootingDelay
    }

    tick(){
        this.moveAlongPath()
        if (this.tickSinceLastShot >= this.shootingInterval){
            this.shoot()
            this.clearTimer()
        }
        this.tickSinceLastShot++
    }

    moveAlongPath(){
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
        this.tickSinceLastShot = this.shootingDelay;
        this.bullets = [];
    }

    clearTimer(){
        this.tickSinceLastShot = 0;
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
        this.bullets.push(new Projectile(projectileX, projectileY, projectileW, projectileH, hSpeed, vSpeed));
    }
}