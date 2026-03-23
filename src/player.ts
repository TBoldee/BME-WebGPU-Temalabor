import {Rect} from "./rect.ts";
import {colors} from "../util/colors.ts";
import {getCollidedRects} from "./physics.ts";

export class Player extends Rect {
    isFalling: boolean;
    isJumping: boolean;
    isStanding: boolean;
    isMovingLeft: boolean;
    isMovingRight: boolean;
    horizontalSpeed: number;
    verticalSpeed: number;
    private speed: number;

    constructor(x: number, y: number) {
        super(x,y,20,60);
        this.isFalling = false;
        this.isJumping = false;
        this.isStanding = true;
        this.horizontalSpeed = 0;
        this.verticalSpeed = 0;
        this.speed = 6;
        this.color = colors["gray"];
    }

    applyGravity(g: number){
        let gravity = Math.abs(g);
        const terminalVelocity: number = 160; // Math.floor(this.h/2);
        if (this.verticalSpeed == 0) {
            this.verticalSpeed = gravity;
            this.isJumping = false;
        } else if (this.verticalSpeed < 0) {
            const multiplier: number = 1 / (1 + (gravity / 10));
            this.verticalSpeed *= multiplier;
            if (this.verticalSpeed > -0.5) this.verticalSpeed = 0;
        } else {
            const multiplier: number = 1 + (gravity / 10);
            this.verticalSpeed *= multiplier;
            if (this.verticalSpeed > terminalVelocity) this.verticalSpeed = terminalVelocity;
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
        if (!this.isMovingLeft) {
            this.isMovingLeft = true;
            this.horizontalSpeed -= this.speed;
        }
    }
    stopMoveLeft(){
        if (this.isMovingLeft) {
            this.isMovingLeft = false;
            this.horizontalSpeed += this.speed;
        }
    }
    startMoveRight(){
        if (!this.isMovingRight) {
            this.isMovingRight = true;
            this.horizontalSpeed += this.speed;
        }
    }
    stopMoveRight(){
        if (this.isMovingRight) {
            this.isMovingRight = false;
            this.horizontalSpeed -= this.speed;
        }
    }

    lieDownIfPossible(rects: Rect[]){
        if (this.isFalling) return;
        this.lieDown();
        if (this.isStanding && getCollidedRects(rects, this).length !== 0) this.lieDown();
    }

    private lieDown(){
        [this.w, this.h] = [this.h, this.w];
        this.moveTo(this.x - (this.w - this.h) / 2, this.y + this.w - this.h);
        this.isStanding = !this.isStanding;
    }

    startJumping(): void {
        if (this.isJumping || this.isFalling) return;
        this.isJumping = true;
        this.verticalSpeed = this.isStanding ? -20 : -10;
    }
}