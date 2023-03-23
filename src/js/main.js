import {Board} from './board.js';


let board = new Board("board");
board.addPieces();


export function gameLoop()
{

    board.render();

    if(board.running) {
        window.requestAnimationFrame(gameLoop);
    } else {
        console.log("CLOSED!");
    }
}


// gameLoop();