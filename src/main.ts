import { Renderer } from './renderer.ts';
import {applyPhysics} from "./physics.ts";
import './input.ts';
import {Level} from "./level.ts";
import {responseFunction} from "./collisionResponse.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const renderer = await Renderer.init(canvas);
let currentLevel: Level = Level.getCurrentLevel();
const timeStep = 1000 / 60;
let lastTime = 0;
let timeAccumulator = 0;

async function frame(currentTime: number) {
    currentLevel = Level.getCurrentLevel();
    if (lastTime === 0) {
        lastTime = currentTime;
    }

    const delta = Math.min(currentTime - lastTime, 250);
    timeAccumulator += delta;
    if (!Level.hasWon){
        while (timeAccumulator >= timeStep) {
            applyPhysics(currentLevel, responseFunction);
            timeAccumulator -= timeStep;
        }
    } else document.getElementById('victory').hidden = false;

    lastTime = currentTime;

    renderer.render(currentLevel).catch(console.error);
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);