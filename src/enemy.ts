import {Rect} from "./rect.ts";

export class Enemy extends Rect {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    horizontalSpeed: number;
    verticalSpeed: number;
    constructor(x: number, y: number, endX: number, endY: number, w: number, h: number, speed: number = 25) {
        super(x, y, w, h, "red", "lava");
        this.startX = x;
        this.startY = y;
        this.endX = endX;
        this.endY = endY;
        speed = speed === 0 ? 1 : speed;
        this.horizontalSpeed = (endX - x) / speed;
        this.verticalSpeed = (endY - y) / speed;
    }

    moveAlongPath(){
        this.move(this.horizontalSpeed, this.verticalSpeed);
        if (this.x === this.endX && this.y === this.endY) {
            if (this.horizontalSpeed !== 0 ){
                this.horizontalSpeed *= -1;
                if (this.horizontalSpeed < 0) this.facing = "left";
                else this.facing = "right";
            }
            this.verticalSpeed *= -1;
            [this.startX, this.startY, this.endX, this.endY] = [this.endX, this.endY, this.startX, this.startY];
        }
    }
}