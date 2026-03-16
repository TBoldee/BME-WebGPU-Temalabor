import {Rect} from "./rect.ts";
import {colors} from "../util/colors.ts";
import {getCollidedRects} from "./physics.ts";

export class Player extends Rect {
    falling: boolean;
    jumping: boolean;
    standing: boolean;
    movingLeft: boolean;
    movingRight: boolean;
    horizontalSpeed: number;
    verticalSpeed: number;
    private speed: number;

    constructor(x: number, y: number) {
        super(x,y,20,60);
        this.falling = false;
        this.jumping = false;
        this.standing = true;
        this.horizontalSpeed = 0;
        this.verticalSpeed = 0;
        this.speed = 6;
        this.color = colors["gray"];
    }

    applyGravity(g: number){
        let gravity = Math.abs(g);
        const maxGravity: number = Math.floor(this.h/2);
        if (this.verticalSpeed == 0) {
            this.verticalSpeed = gravity;
            this.jumping = false;
        } else if (this.verticalSpeed < 0) {
            const multiplier: number = 1 / (1 + (gravity / 10));
            this.verticalSpeed *= multiplier;
            if (this.verticalSpeed > -0.5) this.verticalSpeed = 0;
        } else {
            const multiplier: number = 1 + (gravity / 10);
            this.verticalSpeed *= multiplier;
            if (this.verticalSpeed > maxGravity) this.verticalSpeed = maxGravity;
        }
    }

    moveTo(x: number, y: number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }
    move(x: number, y: number) {
        this.x = Math.floor(this.x + x);
        this.y = Math.floor(this.y + y);

    }
    applySpeed(){
        this.x = Math.floor(this.x + this.horizontalSpeed);
        this.y = Math.floor(this.y + this.verticalSpeed);
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

    lieDownIfPossible(rects: Rect[]){
        if (this.falling) return;
        this.lieDown();
        if (this.standing && getCollidedRects(rects, this).length !== 0) this.lieDown();
    }

    private lieDown(){
        [this.w, this.h] = [this.h, this.w];
        this.moveTo(this.x - (this.w - this.h) / 2, this.y + this.w - this.h);
        this.standing = !this.standing;
    }

    startJumping(): void {
        if (this.jumping || this.falling) return;
        this.jumping = true;
        this.verticalSpeed = this.standing ? -20 : -10;
    }
    stopJumping(): void {
        this.jumping = false;
    }
}