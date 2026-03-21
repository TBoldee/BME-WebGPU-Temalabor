import { Renderer } from './renderer.ts';
import {applyPhysics} from "./physics.ts";
import './input.ts';
import {Level} from "./level.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const renderer = await Renderer.init(canvas);
let currentLevel: Level = Level.getCurrentLevel();
const timeStep = 1000 / 60;
let lastTime = 0;
let timeAccumulator = 0;

function frame(currentTime: number) {
    if (lastTime === 0) {
        lastTime = currentTime;
    }

    const delta = Math.min(currentTime - lastTime, 250);
    timeAccumulator += delta;
    while (timeAccumulator >= timeStep){
        applyPhysics(currentLevel);
        timeAccumulator -= timeStep;
    }

    lastTime = currentTime;

    renderer.render(currentLevel);
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);