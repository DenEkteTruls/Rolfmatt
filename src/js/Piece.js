

export class Piece{
    constructor(start_pos, color)
    {
        // {x: 0, y: 0}
        this.pos = start_pos;
        this.posibilities = [];
        this.color = color;
    }

    _draw(context, piecesize, piece) {
        let image = new Image(50, 50);
        image.src = "media/"+piece+"_"+this.color+".png";
        image.onload = () =>
        {
            context.drawImage(image, piecesize*this.pos.x+10, (piecesize*8)-piecesize*this.pos.y+10, piecesize-20, piecesize-20);
        }
    }
}



export class Pawn extends Piece
{
    constructor(start_pos, color)
    {
        super(start_pos, color);
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "pawn");
    }


    AllowedMoves()
    {
        if(board[this.pos.y+1][this.AllowedMoves.x] === 0 && this.pos.y < 8) {
            let y = this.pos.y + 1
            console.log("the pawn is able to move")
            pos_list.push({x: this.pos.x, y: y})
        } else {
            console.log("this promotes")
        }
    }
}




export class Bishop extends Piece
{
    constructor()
    {
        super(start_pos, color)
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "bishop");
    }


    AllowedMoves()
    {
        
    }
}



export class Knight extends Piece
{
    constructor()
    {
        super(start_pos, color)
        this.dx = [ -2, -1, 1, 2, -2, -1, 1, 2 ]
        this.dy = [ -1, -2, -2, -1, 1, 2, 2, 1 ]
        this.pos_list = []
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "knight");
    }


    AllowedMoves()
    {
        for(let i = 0; i<8;i++) {
            let x = this.pos.x+dx[i]
            let y = this.pos.y+dy[i]
            if(x >= 0 && x < 8 && y < 8 && board[x][y] === 0) {
                this.pos_list.push({x: x, y: y})
            }
        }
    }
}



export class Rook extends Piece
{
    constructor()
    {
        super(start_pos, color)
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "rook");
    }
}



export class Queen extends Piece
{
    constructor()
    {
        super(start_pos, color)
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "queen");
    }
}



export class King extends Piece
{
    constructor()
    {
        super(start_pos, color)
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "king");
    }
}