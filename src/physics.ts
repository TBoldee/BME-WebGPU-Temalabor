import {type Level} from "./level.ts";
import type { Rect } from "./rect.ts";
import {Player} from "./player.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

export function applyPhysics(level: Level): void {
    const player = level.player;
    if (player.y > canvas.height - player.h) return;

    if (!isGrounded(player, level) || player.isJumping) {
        player.isFalling = true;
        if (isHittingCeiling(player, level)) player.verticalSpeed = 0;
        player.applyGravity(level.gravity);
    } else {
        player.isFalling = false;
        player.verticalSpeed = 0;
        player.isJumping = false;
    }

    player.applySpeed();
    getCollisionsAndResolve(level);
}

export function getCollisionsAndResolve(level: Level): void {
    const player = level.player;
    let collidedRects = getCollidedRects(level.rects, player);
    const maximumRecursions = 6;
    let currentRecursions = 0;
    while (collidedRects.length !== 0 && currentRecursions++ < maximumRecursions) {
        resolveCollisions(collidedRects, player);
        collidedRects = getCollidedRects(level.rects, player);
    }
}

export function getCollidedRects(rects: Rect[], player: Player): Rect[]{
    const collidedRects: Rect[] = [];
    for (const rect of rects) {
        if (checkCollision(rect, player)){
            collidedRects.push(rect);
        }
    }
    return collidedRects;
}

function checkCollision(rect: Rect, player: Rect): boolean {
    if ((player.x + player.w <= rect.x || player.x >= rect.x + rect.w)) return false;
    if ((player.y + player.h <= rect.y || player.y >= rect.y + rect.h)) return false;
    return true;
}

function resolveCollisions(collidedRects: Rect[], player: Player): void {
    const smallestMTVRect = findRectWithSmallestMTV(collidedRects, player);
    const [MTVX, MTVY] = calculateMinimumTranslationVector(smallestMTVRect, player);

    if (MTVY <= MTVX || (player.isFalling && !player.isMovingRight && !player.isMovingLeft))  { //prefer vertical resolution if player is falling and not moving
        player.move(0, MTVY * calculateMoveDirection(smallestMTVRect, player, "y"));
    } else if (MTVX < MTVY) {
        player.move(MTVX * calculateMoveDirection(smallestMTVRect, player, "x"),0);
    }
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

function findRectWithSmallestMTV(rects: Rect[], player:Player): Rect {
    let smallest: Rect = rects[0];
    let [smallestMTVX, smallestMTVY] = calculateMinimumTranslationVector(smallest, player);
    for (const rect of rects) {
        let [rectMTVX, rectMTVY] = calculateMinimumTranslationVector(rect, player)
        if (Math.min(rectMTVX, rectMTVY) < Math.min(smallestMTVX, smallestMTVY)){
            smallest = rect;
            [smallestMTVX, smallestMTVY] = [rectMTVX, rectMTVY];
        }
    }
    return smallest;
}

function isGrounded(player: Rect, level: Level): boolean{
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

function isHittingCeiling(player: Rect, level: Level): boolean {
    const ceilingCheckRect: Rect = {
        x: player.x,
        y: player.y-1,
        w: player.w,
        h: 1,
        color: [0,0,0,0]
    };
    for (const rect of level.rects) {
        if (checkCollision(rect, ceilingCheckRect)){
            return true;
        }
    }
    return false;
}