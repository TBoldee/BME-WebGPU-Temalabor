
export abstract class Rect {
    x: number;
    y: number;
    w: number;
    h: number;


    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    moveTo(x: number, y: number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }

    move(x: number, y: number) {
        this.x = this.x + x;
        this.y = this.y + y;
    }

    getTilePosition(): [number, number] {
        const tileSideLength = 64;
        const offset = 64; // Offset for blocker tiles, since matrix row doesn't start at x = 0 because of them
        const centerX = offset + this.x + this.w/2;
        const centerY = this.y + this.h/2;
        return [Math.floor(centerX / tileSideLength), Math.floor(centerY / tileSideLength)];
    }

    getCenter(): [number, number] {
        return [this.x + this.w/2, this.y + this.h/2];
    }
}
