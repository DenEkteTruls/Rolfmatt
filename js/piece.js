

export class Piece{
    constructor(start_pos, color)
    {
        // {x: 0, y: 0}
        this.pos = start_pos;
        this.dragging_pos = start_pos;
        this.posibilities = [];
        this.color = color;
        this.dragging = false;
        this.has_moved = false;

        this.factor = this.color == "w" ? -1 : 1;
    }


    __draw(context, piecesize, image)
    {
        if(!this.dragging) {
            context.drawImage(image, piecesize*this.pos.x+10, piecesize*this.pos.y+10, piecesize-20, piecesize-20);

        } else {
            context.drawImage(image, this.dragging_pos.x-piecesize/2, this.dragging_pos.y-piecesize/2, piecesize, piecesize)
        }
    }
}



export class Pawn extends Piece
{
    constructor(start_pos, color)
    {
        super(start_pos, color);
        this.image = new Image(50, 50);
        this.image.src = "media/pawn_"+this.color+".png";
    }

    
    draw(context, piecesize)
    {
        this.__draw(context, piecesize, this.image)
    }


    AllowedMoves(board)
    {
        this.posibilities = [];

        if(this.pos.y < 7 && this.pos.y > 0) {
            if(!this.has_moved && board[this.pos.y+(this.factor*2)][this.pos.x] == 0 && board[this.pos.y+(this.factor*2)][this.pos.x] == 0) {
                this.posibilities.push({x: this.pos.x, y: this.pos.y+(this.factor*1)})
                this.posibilities.push({x: this.pos.x, y: this.pos.y+(this.factor*2)})
            }
            else if(board[this.pos.y+(this.factor*1)][this.pos.x] == 0) {
                this.posibilities.push({x: this.pos.x, y: this.pos.y+(this.factor*1)})
            }
            if(this.pos.x < 7) {
                let a = board[this.pos.y+(this.factor*1)][this.pos.x+1];
                if(a != 0 && a.color != this.color) {
                    this.posibilities.push({x: this.pos.x+1, y: this.pos.y+(this.factor*1)})
                }
            }
            if(this.pos.x > 0) {
                let a = board[this.pos.y+(this.factor*1)][this.pos.x-1];
                if(a != 0 && a.color != this.color) {
                    this.posibilities.push({x: this.pos.x-1, y: this.pos.y+(this.factor*1)})
                }
            }
        }
    }
}



export class Bishop extends Piece
{
    constructor(start_pos, color)
    {
        super(start_pos, color);
        this.image = new Image(50, 50);
        this.image.src = "media/bishop_"+this.color+".png";

        this.radar = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
    }

    
    draw(context, piecesize)
    {
        this.__draw(context, piecesize, this.image)
    }

    
    AllowedMoves(board)
    {
        this.posibilities = [];
        let stopped = [0, 0, 0, 0];
        for(let z = 1; z < 8; z++) {
            for(let i = 0; i < this.radar.length; i++) {
                let x = this.pos.x + this.radar[i][0] * z;
                let y = this.pos.y + this.radar[i][1] * z;
                if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                    let b = board[y][x];
                    if(b != 0 && b.color == this.color) stopped[i] = 1;
                    if(!stopped[i]) this.posibilities.push({x: x, y: y})
                    if(b != 0 && b.color != this.color) stopped[i] = 1;
                }
            }
        }
    }
}



export class Knight extends Piece
{
    constructor(start_pos, color)
    {
        super(start_pos, color);
        this.image = new Image(50, 50);
        this.image.src = "media/knight_"+this.color+".png";

        this.dx = [-2, -1, 1, 2, -2, -1, 1, 2]
        this.dy = [-1, -2, -2, -1, 1, 2, 2, 1]
    }

    
    draw(context, piecesize)
    {
        this.__draw(context, piecesize, this.image)
    }


    AllowedMoves(board)
    {
        this.posibilities = [];

        for(let i = 0; i < 8;i++) {
            let x = this.pos.x+this.dx[i]
            let y = this.pos.y+this.dy[i]

            if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                let a = board[y][x];
                if(a != 0) {
                    if(a.color == this.color) continue;
                }
                this.posibilities.push({x: x, y: y})
            }
        }
    }
}



export class Rook extends Piece
{
    constructor(start_pos, color)
    {
        super(start_pos, color);
        this.image = new Image(50, 50);
        this.image.src = "media/rook_"+this.color+".png";

        this.radar = [[1, 0], [0, 1], [-1, 0], [0, -1]]
    }

    
    draw(context, piecesize)
    {
        this.__draw(context, piecesize, this.image)
    }


    AllowedMoves(board)
    {
        this.posibilities = [];
        let stopped = [0, 0, 0, 0];
        for(let z = 1; z < 8; z++) {
            for(let i = 0; i < this.radar.length; i++) {
                let x = this.pos.x + this.radar[i][0] * z;
                let y = this.pos.y + this.radar[i][1] * z;
                if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                    let b = board[y][x];
                    if(b != 0 && b.color == this.color) stopped[i] = 1;
                    if(!stopped[i]) this.posibilities.push({x: x, y: y})
                    if(b != 0 && b.color != this.color) stopped[i] = 1;
                }
            }
        }
    }
}



export class Queen extends Piece
{
    constructor(start_pos, color)
    {
        super(start_pos, color);
        this.image = new Image(50, 50);
        this.image.src = "media/queen_"+this.color+".png";

        this.radar = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]]
    }

    
    draw(context, piecesize)
    {
        this.__draw(context, piecesize, this.image)
    }


    AllowedMoves(board)
    {
        this.posibilities = [];
        let stopped = [0, 0, 0, 0, 0, 0, 0, 0];
        for(let z = 1; z < 8; z++) {
            for(let i = 0; i < this.radar.length; i++) {
                let x = this.pos.x + this.radar[i][0] * z;
                let y = this.pos.y + this.radar[i][1] * z;
                if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                    let b = board[y][x];
                    if(b != 0 && b.color == this.color) stopped[i] = 1;
                    if(!stopped[i]) this.posibilities.push({x: x, y: y})
                    if(b != 0 && b.color != this.color) stopped[i] = 1;
                }
            }
        }
    }
}



export class King extends Piece
{
    constructor(start_pos, color)
    {
        super(start_pos, color);
        this.image = new Image(50, 50);
        this.image.src = "media/king_"+this.color+".png";

        this.radar = [[1, 0], [1, 1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]]
    }

    
    draw(context, piecesize)
    {
        this.__draw(context, piecesize, this.image)
    }


    AllowedMoves(board)
    {
        this.posibilities = [];
        for(let i = 0; i < this.radar.length; i++) {
            let x = this.pos.x + this.radar[i][0];
            let y = this.pos.y + this.radar[i][1];

            if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                let b = board[y][x]
                if(!(b != 0 && b.color == this.color)) {
                    this.posibilities.push({x: x, y: y})
                }
            }
        }
    }
}