import {type Level} from "./level.ts";
import type { Rect } from "./rect.ts";
import {Player} from "./player.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

export function applyPhysics(level: Level): void {
    const player = level.player;
    if (player.y > canvas.height - player.h) return;

    if (!checkGrounded(player, level)) {
        player.falling = true;
        player.applyGravity(level.gravity);
    } else {
        player.falling = false;
        player.verticalSpeed = 0;
    }

    player.applySpeed();
    let collidedRects = getCollidedRects(level.rects, player);
    if (collidedRects.length !== 0) resolveCollisions(collidedRects, player);
}


function getCollidedRects(rects: Rect[], player: Player): Rect[]{
    const collidedRects: Rect[] = [];
    for (const rect of rects) {
        if (checkCollision(rect, player)){
            collidedRects.push(rect);
        }
    }
    return collidedRects;
}

function checkCollision(rect: Rect, player: Rect): boolean {
    if ((player.x + player.w < rect.x || player.x > rect.x + rect.w)) return false;
    if ((player.y + player.h < rect.y || player.y > rect.y + rect.h)) return false;
    return true;
}

function resolveCollisions(collidedRects: Rect[], player: Player) {
    const smallestMTVRect = findRectWithSmallestMTV(collidedRects, player);
    collidedRects = removeItem(collidedRects, smallestMTVRect);
    const [MTVX, MTVY] = calculateMinimumTranslationVector(smallestMTVRect, player);

    if (MTVY <= MTVX || (player.falling && !player.movingRight && !player.movingLeft))  { //prefer vertical resolution if player is falling and not moving
        player.move(0, (MTVY + 1) * calculateMoveDirection(smallestMTVRect, player, "y"));//+1 pixel to prevent floating point errors causing the player to get stuck
    } else if (MTVX < MTVY) {
        player.move((MTVX + 1) * calculateMoveDirection(smallestMTVRect, player, "x"),0);
    }
    collidedRects = getCollidedRects(collidedRects, player);
    if (collidedRects.length !== 0) resolveCollisions(collidedRects, player); //Recursive call in case one resolution was not enough
}

function calculateMinimumTranslationVector(rect: Rect, player: Player): [number,number] {
    let xDistance: number;
    let [rectCenterX, rectCenterY] = calculateCenter(rect);
    let [playerCenterX, playerCenterY] = calculateCenter(player);
    if (player.x <= rect.x){
        xDistance = player.x + player.w - rect.x;
    } else if (player.x > rect.x && playerCenterX < rectCenterX){
        xDistance = player.x - rect.x + player.w;
    } else {
        xDistance = rect.x + rect.w - player.x;
    }

    let yDistance: number;
    if (player.y <= rect.y){
        yDistance = player.y + player.h - rect.y;
    } else if (player.y > rect.y && playerCenterY < rectCenterY){
        yDistance = player.y - rect.y + player.h;
    } else {
        yDistance = rect.y + rect.h - player.y;
    }
    return [xDistance, yDistance];
}

function calculateCenter(rect: Rect): [number, number] {
    return [rect.x + rect.w/2, rect.y + rect.h/2];
}

function calculateMoveDirection(rect: Rect, player: Player, axis: "x" | "y"): -1 | 1 {
    const [rectCenterX, rectCenterY] = calculateCenter(rect);
    const [playerCenterX, playerCenterY] = calculateCenter(player);
    if (axis === "x"){
        if (playerCenterX < rectCenterX) return -1;
        else return 1;
    } else if (axis === "y"){
        if (playerCenterY < rectCenterY) return -1;
        else return 1;
    }
}

function removeItem<T>(arr: Array<T>, value: T): Array<T> {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

function findRectWithSmallestMTV(rects: Rect[], player:Player): Rect {
    let smallest: Rect = rects[0];
    for (const rect of rects) {
        if (calculateMinimumTranslationVector(rect, player) < calculateMinimumTranslationVector(smallest, player)){
            smallest = rect;
        }
    }
    return smallest;
}

function checkGrounded(player: Rect, level: Level): boolean{
    const groundCheckRect: Rect = {
        x: player.x,
        y: player.y + player.h,
        w: player.w,
        h: 1,
        color: [0,0,0,0]
    };
    for (const rect of level.rects) {
        if (checkCollision(rect, groundCheckRect)){
            return true;
        }
    }
    return false;
}