import {Rect} from "./rect.ts";
import {colors} from "../util/colors.ts";

export class Player extends Rect {
    falling: boolean;
    jumping: boolean;
    movingLeft: boolean;
    movingRight: boolean;
    horizontalSpeed: number;
    verticalSpeed: number;
    private speed: number;
    visualRectangle: Rect;

    constructor(x: number, y: number) {
        super(x,y,20,60);
        this.falling = false;
        this.jumping = false;
        this.horizontalSpeed = 0;
        this.verticalSpeed = 0;
        this.speed = 7;
        this.visualRectangle = new Rect(x-1, y-1,22,62, "gray");
        this.color = colors["gray"];
    }

    applyGravity(g: number){
        let gravity = Math.abs(g);
        if (this.verticalSpeed == 0){
            this.verticalSpeed = gravity;
        } else {
            const multiplier: number = 1 + (gravity / 10);
            this.verticalSpeed *= multiplier;
            if (this.verticalSpeed > 30) this.verticalSpeed = 30;
        }
    }

    moveTo(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.visualRectangle.x = x-1;
        this.visualRectangle.y = y-1;
    }
    move(x: number, y: number) {
        this.x += x;
        this.y += y;
        this.visualRectangle.x = this.x-1;
        this.visualRectangle.y = this.y-1;
    }
    applySpeed(){
        this.x += this.horizontalSpeed;
        this.y += this.verticalSpeed;
        this.visualRectangle.x = this.x-1;
        this.visualRectangle.y = this.y-1;
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
        this.moveTo(this.x - (this.w - this.h)/2, this.y + this.w - this.h);

        [this.visualRectangle.w, this.visualRectangle.h] = [this.visualRectangle.h, this.visualRectangle.w];
        this.visualRectangle.x = this.x-1;
        this.visualRectangle.y = this.y-1;
    }
}