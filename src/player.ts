import {Rect} from "./rect.ts";
import {colors} from "../util/colors.ts";

export class Player extends Rect {
    falling: boolean;
    jumping: boolean;
    movingLeft: boolean;
    movingRight: boolean;
    horizontalSpeed: number = 0;
    verticalSpeed: number = 0;
    private speed: number = 7;

    constructor(x: number, y: number) {
        super(x,y,20,60);
        this.falling = false;
        this.jumping = false;
        this.color = colors["gray"];
    }

    applyGravity(g: number){
        if (this.verticalSpeed == 0){
            this.verticalSpeed = g;
        } else {
            const multiplier: number = 1 + (g / 10);
            this.verticalSpeed *= multiplier;
            if (this.verticalSpeed > 30) this.verticalSpeed = 30;
        }
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    startMoveLeft(){
        if (!this.movingLeft) {
            this.movingLeft = true;
            this.horizontalSpeed -= this.speed;
        }
    }
    stopMoveLeft(){
        if (this.movingLeft) {
            this.movingLeft = false;
            this.horizontalSpeed += this.speed;
        }
    }
    startMoveRight(){
        if (!this.movingRight) {
            this.movingRight = true;
            this.horizontalSpeed += this.speed;
        }
    }
    stopMoveRight(){
        if (this.movingRight) {
            this.movingRight = false;
            this.horizontalSpeed -= this.speed;
        }
    }

    lieDown(){
        if (this.falling) return;
        [this.w, this.h] = [this.h, this.w];
        this.move(this.x - (this.w - this.h)/2, this.y + this.w - this.h);
    }
}