import {Level} from "./level.ts";
import {getCollisionsAndResolve} from "./physics.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
let currentLevel: Level = Level.getCurrentLevel();

canvas.addEventListener('mousedown', (event) => {
    currentLevel = Level.getCurrentLevel();
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
    currentLevel = Level.getCurrentLevel();
    switch (event.key) {
        case 'W':
        case 'w':
        case ' ':
        case 'ArrowUp':
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
        case 's':
        case 'S':
        case 'ArrowDown':
            currentLevel.player.lieDownIfPossible(currentLevel.getRectsForCollision());
            break;
        case 'r':
            if (Level.hasWon){
                document.getElementById('victory').hidden = true;
                Level.restartGame();
            }
            break;
        default:
            break;
    }
    getCollisionsAndResolve(currentLevel);
})

window.addEventListener('keyup', (event) => {
    currentLevel = Level.getCurrentLevel();
    switch (event.key) {
        case 'W':
        case 'w':
        case ' ':
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