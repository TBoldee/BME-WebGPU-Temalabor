import { Renderer } from './renderer.ts';
import { testLevel } from './level.ts';
import {applyPhysics} from "./physics.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const renderer = await Renderer.init(canvas);

canvas.addEventListener('mousedown', (event) => {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    testLevel.player.move(x, y);
});

function frame() {
    renderer.render(testLevel);
    requestAnimationFrame(frame);
}
window.setInterval(() => applyPhysics(testLevel), 100);
requestAnimationFrame(frame);