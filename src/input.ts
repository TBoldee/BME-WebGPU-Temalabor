import {Level} from "./level.ts";

export class Input {
    private static canvas = document.querySelector('canvas') as HTMLCanvasElement;
    private static currentLevel: Level = Level.getCurrentLevel();
    private static keySet = new Set<string>();
    private static previousKeys = new Set<string>();

    static init() {
        Input.canvas.addEventListener('mousedown', (event) => {
            Input.currentLevel = Level.getCurrentLevel();
            if (event.button === 0) {
                let rect = Input.canvas.getBoundingClientRect();
                let x = event.clientX - rect.left;
                let y = event.clientY - rect.top;
                Input.currentLevel.player.moveTo(x, y);
                console.log(`Clicked: ${x} : ${y}`);
            }
        })

        window.addEventListener('keydown', (event) => {
            const key = event.key;
            Input.currentLevel = Level.getCurrentLevel();
            switch (key) {
                case 'W':
                case 'w':
                case ' ':
                case 'ArrowUp':
                    if (Input.keySet.has('ArrowUp')) return
                    Input.currentLevel.player.startJumping();
                    Input.keySet.add('ArrowUp');
                    break;
                case 'A':
                case 'a':
                case 'ArrowLeft':
                    if (Input.keySet.has('ArrowLeft')) return
                    Input.currentLevel.player.startMoveLeft();
                    Input.keySet.add('ArrowLeft');
                    break;
                case 'D':
                case 'd':
                case 'ArrowRight':
                    if (Input.keySet.has('ArrowRight')) return
                    Input.currentLevel.player.startMoveRight();
                    Input.keySet.add('ArrowRight');
                    break;
                case 'c':
                case 'C':
                case 's':
                case 'S':
                case 'ArrowDown':
                    if (Input.keySet.has('ArrowDown')) return
                    Input.keySet.add('ArrowDown');
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
            Input.currentLevel = Level.getCurrentLevel();
            switch (event.key) {
                case 'W':
                case 'w':
                case ' ':
                    Input.keySet.delete('ArrowUp');
                    break;
                case 'A':
                case 'a':
                case 'ArrowLeft':
                    Input.keySet.delete('ArrowLeft');
                    Input.currentLevel.player.stopMoveLeft();
                    break;
                case 'D':
                case 'd':
                case 'ArrowRight':
                    Input.keySet.delete('ArrowRight');
                    Input.currentLevel.player.stopMoveRight();
                    break;
                case 'c':
                case 'C':
                case 's':
                case 'S':
                case 'ArrowDown':
                    break;
                default:
                    break;
            }
        })
    }

    static applyPressedKeys() {
        if (Input.keySet.has('ArrowLeft')) Input.currentLevel.player.startMoveLeft();
        if (Input.keySet.has('ArrowRight')) Input.currentLevel.player.startMoveRight();
        if (Input.keySet.has('ArrowUp')) Input.currentLevel.player.startJumping()
        if (Input.isJustPressed('ArrowDown')) {
            Input.currentLevel.player.lieDownIfPossible(Input.currentLevel.getRectsForCollision());
            Input.keySet.delete('ArrowDown');
        }

        Input.previousKeys = new Set(Input.keySet);
    }

    private static isJustPressed(key: string): boolean {
        return Input.keySet.has(key) && !Input.previousKeys.has(key);
    }
}



