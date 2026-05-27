import {Hazard} from "./hazard.ts";

export class Projectile extends Hazard {
    private horizontalSpeed: number;
    private verticalSpeed: number;

    constructor(x: number, y: number, w: number, h: number, horizontalSpeed: number, verticalSpeed: number) {
        super(x, y, w, h, "red", "ball");
        this.horizontalSpeed = horizontalSpeed;
        this.verticalSpeed = verticalSpeed;
    }

    applySpeed(){
        this.x = Math.floor(this.x + this.horizontalSpeed);
        this.y = Math.floor(this.y + this.verticalSpeed);
    }
}