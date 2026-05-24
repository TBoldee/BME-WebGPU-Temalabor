import { Renderer } from './renderer.ts';
import {applyPhysics} from "./physics.ts";
import './input.ts';
import {Level} from "./level.ts";
import {responseFunction} from "./collisionResponse.ts";
import {applyPressedKeys} from "./input.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const renderer = await Renderer.init(canvas);
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
            applyPressedKeys()
            applyPhysics(currentLevel, responseFunction);
            currentLevel.killPlayerIfOOB()
            timeAccumulator -= timeStep;
        }
    } else document.getElementById('victory').hidden = false;

    lastTime = currentTime;

    currentLevel = Level.getCurrentLevel();
    renderer.render(currentLevel).catch(console.error);
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);