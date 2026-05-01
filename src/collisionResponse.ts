import type {Rect} from "./rect.ts";
import type {Player} from "./player.ts";
import {Lava} from "./lava.ts";
import type {Level} from "./level.ts";
import {Enemy} from "./enemy.ts";

export type CollisionResponseHelper = (rects: Rect[], player: Player, level: Level) => void;

export function responseFunction (rects: Rect[], player: Player, level: Level):void {
    for (const rect of rects) {
        if (rect instanceof Lava || rect instanceof Enemy) {
            player.kill();
            level.start();
        }
    }
}