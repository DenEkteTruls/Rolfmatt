
import {Bishop, Knight, Pawn, Rook, Queen, King} from "./piece.js";



export class Board
{
    constructor(canvasID)
    {
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");

        this.__setMouseEvents();

        this.running = true;
        this.pieceSize = 600/8;
        this.dark_color = "#8877b7"
        this.light_color = "#efefef";
        this.mouse_pos = {x: 0, y: 0};

        this.is_dragging = false;
        this.dragging_piece = undefined;
        this.dragging_mouse_pos = {x: 0, y: 0};

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


    __setMouseEvents()
    {
        let rect = this.canvas.getBoundingClientRect();
        this.canvas.onmousedown = (e) => {
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            this.mouse_pos = this.translate_mouse_pos(x, y);
            this.dragging_piece = this.getCurrentPiece();
            if(this.dragging_piece) this.dragging_piece.AllowedMoves(this.board)

            if(this.dragging_piece != 0) {
                this.is_dragging = true;
                this.dragging_mouse_pos.x = x;
                this.dragging_mouse_pos.y = y;
                this.dragging_piece.dragging = true;
                this.dragging_piece.dragging_pos = this.dragging_mouse_pos;
            }
        }

        this.canvas.onmousemove = (e) => {
            if(this.is_dragging) {
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;
                this.dragging_mouse_pos.x = x;
                this.dragging_mouse_pos.y = y;
                this.dragging_piece.dragging_pos = this.dragging_mouse_pos;
            }
        }

        this.canvas.onmouseup = (e) => {
            if(this.is_dragging && this.dragging_piece) {
                this.is_dragging = false;
                this.movePiece(this.dragging_piece, this.dragging_mouse_pos.x, this.dragging_mouse_pos.y);
                this.dragging_piece.dragging = false;
            }

            this.dragging_mouse_pos = {x: 0, y: 0};
            this.dragging_piece = undefined;
        }
    }


    translate_mouse_pos(x, y)
    {
        let ix = 0
        let iy = 0

        let min_x_diff = 1000
        let min_y_diff = 1000

        for(let i = this.pieceSize/2; i < this.pieceSize*9; i += this.pieceSize)
        {
            let xdiff = Math.abs(x - i);
            let ydiff = Math.abs(y - i);

            if(xdiff < min_x_diff) {
                min_x_diff = xdiff
                ix = i/this.pieceSize-.5;
            } if(ydiff < min_y_diff) {
                min_y_diff = ydiff
                iy = i/this.pieceSize-.5;
            }
        }

        return {x: ix, y: iy}
    }



    movePiece(piece, x, y)
    {
        let new_pos = this.translate_mouse_pos(x, y);
        //console.log(piece.posibilities, new_pos);
        for(let i = 0; i < piece.posibilities.length; i++)
        {
            if(piece.posibilities[i].x == new_pos.x && piece.posibilities[i].y == new_pos.y) {
                this.board[piece.pos.y][piece.pos.x] = 0;
                this.board[new_pos.y][new_pos.x] = piece;
                if(!piece.has_moved) piece.has_moved = true;
                
                piece.pos.x = new_pos.x;
                piece.pos.y = new_pos.y;
            }
        }
        // console.log(piece.pos, new_pos)
    }



    renderBoard()
    {
        let last_color = 1;
        for(let y = 0; y < 8; y++) {
            
            last_color = !last_color

            //drawing board
            for(let x = 0; x < 8; x++) {
                this.ctx.fillStyle = (last_color ? this.dark_color : this.light_color);
                if(this.dragging_piece) {
                    let new_pos = this.translate_mouse_pos(this.dragging_mouse_pos.x, this.dragging_mouse_pos.y)
                    if(new_pos.x == x && new_pos.y == y) {
                        this.ctx.fillStyle = "lightgreen";    
                    }
                }
                this.ctx.fillRect(x * this.pieceSize, y * this.pieceSize, this.pieceSize, this.pieceSize);
                last_color = !last_color

                //drawing characters
                this.ctx.fillStyle = (last_color ? this.dark_color : this.light_color);
                this.ctx.font = "20px Arial";
                this.ctx.fillText(String.fromCharCode(97 + x), (this.pieceSize * x+55), (this.pieceSize * 8 - 10));
            }

            // drawing numbers
            this.ctx.fillStyle = (!last_color ? this.dark_color : this.light_color);
            this.ctx.font = "20px Arial";
            this.ctx.fillText(8-y, 5, (this.pieceSize * y)+25);
        }
    }


    addPieces()
    {
        /*   --- PAWNs ----   */
        for(let i = 0; i < 8; i++) {
            let pawn = new Pawn({x: i, y: 6}, 'w');
            this.board[pawn.pos.y][pawn.pos.x] = pawn;
        }

        for(let i = 0; i < 8; i++) {
            let pawn = new Pawn({x: i, y: 1}, 'b');
            this.board[pawn.pos.y][pawn.pos.x] = pawn;
        }

        /*   --- BISHOPs ----   */
        let bishop1 = new Bishop({x: 2, y: 7}, 'w'); let bishop2 = new Bishop({x: 5, y: 7}, 'w')
        this.board[bishop1.pos.y][bishop1.pos.x] = bishop1; this.board[bishop2.pos.y][bishop2.pos.x] = bishop2
        let bishop11 = new Bishop({x: 2, y: 0}, 'b'); let bishop21 = new Bishop({x: 5, y: 0}, 'b')
        this.board[bishop11.pos.y][bishop11.pos.x] = bishop11; this.board[bishop21.pos.y][bishop21.pos.x] = bishop21


        /*   --- KNIGHTs ----   */
        let knight1 = new Knight({x: 1, y: 7}, 'w'); let knight2 = new Knight({x: 6, y: 7}, 'w')
        this.board[knight1.pos.y][knight1.pos.x] = knight1; this.board[knight2.pos.y][knight2.pos.x] = knight2
        let knight11 = new Knight({x: 1, y: 0}, 'b'); let knight21 = new Knight({x: 6, y: 0}, 'b')
        this.board[knight11.pos.y][knight11.pos.x] = knight11; this.board[knight21.pos.y][knight21.pos.x] = knight21


        /*   --- ROOKs ----   */
        let rook1 = new Rook({x: 0, y: 7}, 'w'); let rook2 = new Rook({x: 7, y: 7}, 'w')
        this.board[rook1.pos.y][rook1.pos.x] = rook1;; this.board[rook2.pos.y][rook2.pos.x] = rook2;
        let rook11 = new Rook({x: 0, y: 0}, 'b'); let rook21 = new Rook({x: 7, y: 0}, 'b')
        this.board[rook11.pos.y][rook11.pos.x] = rook11; this.board[rook21.pos.y][rook21.pos.x] = rook21;


        /*   --- QUEENs ----   */
        let queen1 = new Queen({x: 3, y: 7}, 'w'); let queen2 = new Queen({x: 3, y: 0}, 'b')
        this.board[queen1.pos.y][queen1.pos.x] = queen1; this.board[queen2.pos.y][queen2.pos.x] = queen2;


        /*   --- KINGs ----   */
        let king1 = new King({x: 4, y: 7}, 'w'); let king2 = new King({x: 4, y: 0}, 'b')
        this.board[king1.pos.y][king1.pos.x] = king1; this.board[king2.pos.y][king2.pos.x] = king2;

    }



    getCurrentPiece()
    {
        return this.board[this.mouse_pos.y][this.mouse_pos.x];
    }


    renderAllowedMoves()
    {
        if(this.dragging_piece) {
            for(let i =  0; i < this.dragging_piece.posibilities.length; i++)
            {
                this.ctx.fillStyle = 'lightgreen';
                this.ctx.beginPath();
                this.ctx.arc(this.dragging_piece.posibilities[i].x * this.pieceSize + this.pieceSize/2, this.dragging_piece.posibilities[i].y * this.pieceSize + this.pieceSize/2, 10, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }



    renderPieces()
    {
        for(let y = 0; y < this.board.length; y++)
        {
            for(let x = 0; x < this.board.length; x++)
            {
                if(this.board[y][x] != 0) {
                    this.board[y][x].draw(this.ctx, this.pieceSize);
                }
            }
        }
    }

    

    render()
    {
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderBoard();
        this.renderPieces();
        this.renderAllowedMoves();
    }
}