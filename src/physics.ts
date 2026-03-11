import type {Level} from "./level.ts";
const canvas = document.querySelector('canvas') as HTMLCanvasElement;
//const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
export function applyPhysics(level: Level) {
    const player = level.player;
    if (player.y < canvasHeight - player.h){
        player.y = Math.min(canvasHeight - player.h, player.y + 20);
    }
}