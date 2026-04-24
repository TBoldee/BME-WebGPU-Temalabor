import {Rect} from "./rect.ts";

export class Enemy extends Rect {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    horizontalSpeed: number;
    verticalSpeed: number;
    speed: number;
    direction: "forward" | "backward";
    constructor(x: number, y: number, endX: number, endY: number, w: number, h: number, speed: number = 25) {
        super(x, y, w, h, "red", "lava");
        this.startX = x;
        this.startY = y;
        this.endX = endX;
        this.endY = endY;
        this.speed = speed === 0 ? 1 : speed;
        this.horizontalSpeed = (endX - x) / speed;
        this.verticalSpeed = (endY - y) / speed;
        this.direction = "forward";
    }

    moveAlongPath(){
        this.move(this.horizontalSpeed, this.verticalSpeed);
        if ((this.direction === "forward" && this.x === this.endX && this.y === this.endY) ||
            (this.direction === "backward" && this.x === this.startX && this.y === this.startY)) {
            if (this.horizontalSpeed !== 0 ){
                this.horizontalSpeed *= -1;
                if (this.horizontalSpeed < 0) this.facing = "left";
                else this.facing = "right";
            }
            this.verticalSpeed *= -1;
            this.direction = this.direction === "forward" ? "backward" : "forward";
        }
    }

    reset(){
        this.direction = "forward";
        this.horizontalSpeed = (this.endX - this.startX) / this.speed;
        this.verticalSpeed = (this.endY - this.startY) / this.speed;
        this.moveTo(this.startX, this.startY);
    }
}