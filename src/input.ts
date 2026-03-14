import {testLevel} from "./level.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        testLevel.player.move(x, y);
    }
});

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'W':
        case 'w':
        case ' ':
            break;
        case 'A':
        case 'a':
            testLevel.player.startMoveLeft();
            break;
        case 'D':
        case 'd':
            testLevel.player.startMoveRight();
            break;
        default:
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'W':
        case 'w':
        case ' ':
            break;
        case 'A':
        case 'a':
            testLevel.player.stopMoveLeft();
            break;
        case 'D':
        case 'd':
            testLevel.player.stopMoveRight();
            break;
        default:
            break;
    }
})