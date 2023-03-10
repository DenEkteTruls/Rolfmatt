
import {Pawn} from "./Piece";



export class Board
{
    constructor()
    {
        this.pieceSize = 600/8;
        this.dark_color = "#8877b7"
        this.light_color = "#efefef";

        this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]
    }



    addPieces(context)
    {
        for(let i = 0; i < 8; i++) {
            let pawn = new Pawn({x: i, y: 2}, 'w');
            pawn.draw(context, this.pieceSize);
        }

        for(let i = 0; i < 8; i++) {
            let pawn = new Pawn({x: i, y: 7}, 'b');
            pawn.draw(context, this.pieceSize);
        }
    }
}