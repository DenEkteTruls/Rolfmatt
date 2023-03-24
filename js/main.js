
import {Board} from './board.js';

let board = new Board(12309120389, "board", 700);
board.addPieces();


export function gameLoop()
{
    board.render();

    if(board.running) {
        window.requestAnimationFrame(gameLoop);
    } else {
        console.log("OPSI DAYSI!");
    }
}


gameLoop();