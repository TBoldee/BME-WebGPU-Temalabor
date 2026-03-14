import { Renderer } from './renderer.ts';
import { testLevel } from './level.ts';
import {applyPhysics} from "./physics.ts";
import './input.ts';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const renderer = await Renderer.init(canvas);

function frame() {
    renderer.render(testLevel);
    requestAnimationFrame(frame);
}
window.setInterval(() => applyPhysics(testLevel), 17);
requestAnimationFrame(frame);