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
    constructor(x: number, y: number, endX: number, endY: number, w: number, h: number, speed: number = 35) {
        super(x, y, w, h, "red", "demon");
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
        const passedGoalForward = (this.direction === "forward" &&
            ((this.startX < this.endX && this.x >= this.endX) || (this.startX > this.endX && this.x <= this.endX ||
            this.startY < this.endY && this.y >= this.endY) || (this.startY > this.endY && this.y <= this.endY)));
        const passedGoalBackward = (this.direction === "backward" &&
            ((this.startX < this.endX && this.x <= this.startX) || (this.startX > this.endX && this.x >= this.startX ||
                this.startY < this.endY && this.y <= this.startY) || (this.startY > this.endY && this.y >= this.startY)))
        if (passedGoalForward || passedGoalBackward) {
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