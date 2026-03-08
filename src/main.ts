import { Renderer } from './renderer.ts';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const renderer = await Renderer.init(canvas);

function frame() {
    renderer.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
