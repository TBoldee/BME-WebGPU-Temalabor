import { Renderer } from './renderer.ts';
import { testLevel } from './level.ts';
import {applyPhysics} from "./physics.ts";
import './input.ts';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const renderer = await Renderer.init(canvas);
const timeStep = 17;
let lastTime = 0;
let timeAccumulator = 0;

function frame(currentTime: number) {
    if (lastTime === 0) {
        lastTime = currentTime;
    }

    const delta = currentTime - lastTime;
    timeAccumulator += delta;
    while (timeAccumulator >= timeStep){
        applyPhysics(testLevel);
        timeAccumulator -= timeStep;
    }
    lastTime = currentTime;

    renderer.render(testLevel);
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);