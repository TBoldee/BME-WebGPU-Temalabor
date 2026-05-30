import { Renderer } from './renderer.ts';
import './input.ts';
import {Level} from "./level.ts";
import {Input} from "./input.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const renderer = await Renderer.init(canvas);
Level.init()
Input.init();
let currentLevel: Level = Level.getCurrentLevel();
currentLevel.start();
const timeStep = 1000 / 60;
let lastTime = 0;
let timeAccumulator = 0;

async function frame(currentTime: number) {
    if (lastTime === 0) {
        lastTime = currentTime;
    }

    if (!Level.hasWon) {
        const delta = Math.min(currentTime - lastTime, 250);
        timeAccumulator += delta;
        while (timeAccumulator >= timeStep) {
            Input.applyPressedKeys()
            currentLevel.tick()
            currentLevel.physicsUpdate()
            currentLevel.killPlayerIfOOB()
            timeAccumulator -= timeStep;
        }
    } else document.getElementById('victory').hidden = false;

    lastTime = currentTime;

    if (Level.levelChanged) currentLevel = Level.getCurrentLevel();
    try {
        renderer.render(currentLevel);
    } catch (e) {
        console.error(e);
        return;
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);