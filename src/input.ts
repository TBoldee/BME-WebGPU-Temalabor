import {Level} from "./level.ts";
import {getCollisionsAndResolve} from "./physics.ts";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
let currentLevel: Level = Level.getCurrentLevel();
const keySet = new Set<string>();

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
})

window.addEventListener('keydown', (event) => {
    const key = event.key;
    currentLevel = Level.getCurrentLevel();
    switch (key) {
        case 'W':
        case 'w':
        case ' ':
        case 'ArrowUp':
            if (keySet.has('ArrowUp')) return
            currentLevel.player.startJumping();
            keySet.add('ArrowUp');
            break;
        case 'A':
        case 'a':
        case 'ArrowLeft':
            if (keySet.has('ArrowLeft')) return
            currentLevel.player.startMoveLeft();
            keySet.add('ArrowLeft');
            break;
        case 'D':
        case 'd':
        case 'ArrowRight':
            if (keySet.has('ArrowRight')) return
            currentLevel.player.startMoveRight();
            keySet.add('ArrowRight');
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
})

window.addEventListener('keyup', (event) => {
    currentLevel = Level.getCurrentLevel();
    switch (event.key) {
        case 'W':
        case 'w':
        case ' ':
            keySet.delete('ArrowUp');
            break;
        case 'A':
        case 'a':
        case 'ArrowLeft':
            keySet.delete('ArrowLeft');
            currentLevel.player.stopMoveLeft();
            break;
        case 'D':
        case 'd':
        case 'ArrowRight':
            keySet.delete('ArrowRight');
            currentLevel.player.stopMoveRight();
            break;
        default:
            break;
    }
})

export function applyPressedKeys() {
    if (keySet.has('ArrowLeft')) currentLevel.player.startMoveLeft();
    if (keySet.has('ArrowRight')) currentLevel.player.startMoveRight();
    if (keySet.has('ArrowUp')) currentLevel.player.startJumping()
}