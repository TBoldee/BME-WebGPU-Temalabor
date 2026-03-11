export class Player {
    x: number;
    y: number;
    readonly w: number;
    readonly h: number;
    falling: boolean;
    jumping: boolean;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.w = 20;
        this.h = 60;
        this.falling = false;
        this.jumping = false;
    }


}