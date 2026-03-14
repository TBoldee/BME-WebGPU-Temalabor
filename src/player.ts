import {Rect} from "./rect.ts";

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
}