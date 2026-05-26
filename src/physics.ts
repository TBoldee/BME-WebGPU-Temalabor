import {type Level} from "./level.ts";
import { Rect } from "./rect.ts";
import {Player} from "./player.ts";
import type {CollisionResponseHelper} from "./collisionResponse.ts";
import {VisualRect} from "./visualRect.ts";

export class Physics {
    static applyPhysics(level: Level, collisionResponseHandler: CollisionResponseHelper): void {
        const player = level.player;
        let collidedSpikes: Rect[] = Physics.getCollidedRects(level.getHazards(), player);
        collisionResponseHandler(collidedSpikes, player, level);

        if (!Physics.isGrounded(player, level) || player.isJumping) {
            player.isFalling = true;
            if (Physics.isHittingCeiling(player, level)) player.verticalSpeed = 0;
            player.applyGravity(level.gravity);
        } else {
            player.isFalling = false;
            player.verticalSpeed = 0;
            player.isJumping = false;
        }
        for (const bullet of level.projectiles) {
            if (Physics.getCollidedRects(level.getRectsForCollision(), bullet).length) level.projectiles = level.projectiles.filter(b => b !== bullet);
        }

        Physics.sweptAABB(player, level.getRectsWithoutLavaForCollision());
    }

    static getCollidedRects(rects: Rect[], player: Rect): Rect[]{
        const collidedRects: Rect[] = [];
        for (const rect of rects) {
            if (Physics.checkCollision(rect, player)){
                collidedRects.push(rect);
            }
        }
        return collidedRects;
    }

    private static checkCollision(rect: Rect, player: Rect): boolean {
        if ((player.x + player.w <= rect.x || player.x >= rect.x + rect.w)) return false;
        if ((player.y + player.h <= rect.y || player.y >= rect.y + rect.h)) return false;
        return true;
    }

    private static collidesOnX(rect: Rect, player: Rect) {
        return !(player.x + player.w <= rect.x || player.x >= rect.x + rect.w);
    }
    private static collidesOnY(rect: Rect, player: Rect) {
        return !(player.y + player.h <= rect.y || player.y >= rect.y + rect.h);
    }

    static checkGoal(level: Level){
        return Physics.checkCollision(level.goal, level.player);
    }

    private static isGrounded(player: Rect, level: Level): boolean{
        const groundCheckRect = new VisualRect(player.x, player.y + player.h, player.w, 1, "transparent")
        for (const rect of level.getRectsWithoutLavaForCollision()) {
            if (Physics.checkCollision(rect, groundCheckRect)){
                return true;
            }
        }
        return false;
    }

    private static isHittingCeiling(player: Rect, level: Level): boolean {
        const ceilingCheckRect = new VisualRect(player.x, player.y-1, player.w, 1, "transparent")
        for (const rect of level.getRectsWithoutLavaForCollision()) {
            if (Physics.checkCollision(rect, ceilingCheckRect)){
                return true;
            }
        }
        return false;
    }

    private static findFirstCollisions(player: Player, rect: Rect): [number, number] {
        let DX;
        let DY;
        if (player.horizontalSpeed > 0) {
            DX = rect.x - (player.x + player.w);
        } else {
            DX = rect.x + rect.w - player.x;
        }
        if (player.verticalSpeed > 0) {
            DY = rect.y - (player.y + player.h);
        } else {
            DY = rect.y + rect.h - player.y;
        }
        let xTime: number;
        if (player.horizontalSpeed === 0) {
            if (Physics.collidesOnX(rect, player)) xTime  = -Infinity;
            else xTime = Infinity;
        } else xTime = DX / player.horizontalSpeed;

        let yTime: number;
        if (player.verticalSpeed === 0) {
            if (Physics.collidesOnY(rect, player)) yTime  = -Infinity;
            else yTime = Infinity;
        } else yTime = DY / player.verticalSpeed;
        return [xTime, yTime];
    }

    private static findLastCollisions(player: Player, rect: Rect): [number, number]{
        let DX;
        let DY;
        if (player.horizontalSpeed > 0) {
            DX = rect.x + rect.w - player.x;
        } else {
            DX = rect.x - (player.x + player.w);
        }
        if (player.verticalSpeed > 0) {
            DY = rect.y + rect.h - player.y;
        } else {
            DY = rect.y - (player.y + player.h);
        }
        let xTime: number;
        if (player.horizontalSpeed === 0) {
            if (Physics.collidesOnX(rect, player)) xTime  = Infinity;
            else xTime = -Infinity;
        } else xTime = DX / player.horizontalSpeed;

        let yTime: number;
        if (player.verticalSpeed === 0) {
            if (Physics.collidesOnY(rect, player)) yTime  = Infinity;
            else yTime = -Infinity;
        } else yTime = DY / player.verticalSpeed;

        return [xTime, yTime];
    }

    private static sweptAABB(player: Player, rects: Rect[]): void {
        // Horizontal pass
        const savedVertical = player.verticalSpeed;
        player.verticalSpeed = 0;
        Physics.resolvePass(player, rects);
        player.verticalSpeed = savedVertical;

        // Vertical pass
        const savedHorizontal = player.horizontalSpeed;
        player.horizontalSpeed = 0;
        Physics.resolvePass(player, rects);
        player.horizontalSpeed = savedHorizontal;
    }

    private static resolvePass(player: Player, rects: Rect[]): void {
        let minEntryTime = 1;
        let entryNormalForCollision = [0, 0];

        for (const rect of rects) {
            const entryVector = Physics.findFirstCollisions(player, rect);
            const exitVector = Physics.findLastCollisions(player, rect);
            const entryTime = Math.max(...entryVector);
            const exitTime = Math.min(...exitVector);

            if (entryTime < exitTime && entryTime < 1 && entryTime >= 0) {
                if (entryTime < minEntryTime) {
                    minEntryTime = entryTime;
                    if (entryVector[0] > entryVector[1]) {
                        entryNormalForCollision = [player.horizontalSpeed > 0 ? -1 : 1, 0];
                    } else {
                        entryNormalForCollision = [0, player.verticalSpeed > 0 ? -1 : 1];
                    }
                }
            }
        }

        player.move(minEntryTime * player.horizontalSpeed, minEntryTime * player.verticalSpeed);
        Physics.nullMovementBasedOnEntryNormal({ x: entryNormalForCollision[0], y: entryNormalForCollision[1] }, player);
    }

    private static nullMovementBasedOnEntryNormal({x, y}: {x: number; y: number}, player: Player) {
        if (y !== 0) {
            player.verticalSpeed = 0;
        }
        if (x === -1) {
            player.stopMoveRight();
        }
        else if (x === 1) {
            player.stopMoveLeft();
        }
    }
}

