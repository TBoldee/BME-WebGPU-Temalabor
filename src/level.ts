import {colors} from '../util/colors.ts';

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
    color?: number[];
}

export interface Level {
    rects: Rect[];
}

export const testLevel: Level = {
    rects: [
        { x: 0,   y: 0, w: 900, h: 900, color: colors["blue"] },
        // floor
        { x: 0,   y: 800, w: 900, h: 100, color: colors["green"] },
        // left wall
        { x: 0,   y: 0,   w: 50,  h: 900, color: colors["gray"] },
        // right wall
        { x: 850, y: 0,   w: 50,  h: 900, color: colors["gray"] },
        // platforms
        { x: 200, y: 550, w: 200, h: 30,  color: colors["brown"] },
        { x: 500, y: 400, w: 200, h: 30,  color: colors["brown"] },
    ],
};

