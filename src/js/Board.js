
import {Pawn} from "./Piece";



export class Board
{
    constructor()
    {
        this.pieceSize = 600/8;
        this.dark_color = "#8877b7"
        this.light_color = "#efefef";
        this.mouse_pos = {x: 0, y: 0};

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


    update_mouse_pos(x, y)
    {
        this.mouse_pos.x = x;
        this.mouse_pos.y = y;

        let ix = 0
        let iy = 0

        let min_x_diff = 1000
        let min_y_diff = 1000

        for(let i = this.pieceSize/2; i < this.pieceSize*8; i += this.pieceSize)
        {
            let xdiff = Math.abs(this.mouse_pos.x - i);
            let ydiff = Math.abs(this.mouse_pos.y - i);

            if(xdiff < min_x_diff) {
                min_x_diff = xdiff
                ix = i/this.pieceSize-0.5;
            } if(ydiff < min_y_diff) {
                min_y_diff = ydiff
                iy = i/this.pieceSize-0.5;
            }
        }

        console.log(ix, iy)
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