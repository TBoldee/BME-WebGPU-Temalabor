import {Level} from "./level.ts";
import {getCollisionsAndResolve} from "./physics.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
let currentLevel: Level = Level.getCurrentLevel();

canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        currentLevel.player.moveTo(x, y);
        getCollisionsAndResolve(currentLevel);
        console.log(`Clicked: ${x} : ${y}`);
    }
});

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'W':
        case 'w':
        case ' ':
            currentLevel.player.startJumping();
            break;
        case 'A':
        case 'a':
        case 'ArrowLeft':
            currentLevel.player.startMoveLeft();
            break;
        case 'D':
        case 'd':
        case 'ArrowRight':
            currentLevel.player.startMoveRight();
            break;
        case 'c':
        case 'C':
            currentLevel.player.lieDownIfPossible(currentLevel.rects);
            break;
        default:
            break;
    }
    getCollisionsAndResolve(currentLevel);
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'W':
        case 'w':
        case ' ':
            currentLevel.player.stopJumping();
            break;
        case 'A':
        case 'a':
        case 'ArrowLeft':
            currentLevel.player.stopMoveLeft();
            break;
        case 'D':
        case 'd':
        case 'ArrowRight':
            currentLevel.player.stopMoveRight();
            break;
        default:
            break;
    }
})