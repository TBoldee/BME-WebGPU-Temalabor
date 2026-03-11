import type {Level, Rect} from "./level.ts";
import type {Player} from "./player.ts";
const canvas = document.querySelector('canvas') as HTMLCanvasElement;
//const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
export function applyPhysics(level: Level): void {
    const player = level.player;
    if (player.y > canvasHeight - player.h) return;

    player.y = Math.min(canvasHeight - player.h, player.y + 20);
    let collidedRects = getCollidedRects(level);
    if (collidedRects.length !== 0) resolveCollisions(collidedRects, player);
}


function getCollidedRects(level: Level){
    const collidedRects: Rect[] = [];
    for (const rect of level.rects) {
        if (checkCollision(rect, level.player)){
            collidedRects.push(rect);
        }
    }
    return collidedRects;
}
function checkCollision(rect: Rect, player: Player): boolean {
    if (player.x + player.w < rect.x || player.x > rect.x + rect.w){
        if (player.y + player.h < rect.y || player.y > rect.y + rect.h){
            return false;
        }
    }
    return true;
}

function resolveCollisions(collidedRects: Rect[], player: Player) {
    
}