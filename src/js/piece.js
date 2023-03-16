

export class Piece{
    constructor(start_pos, color)
    {
        // {x: 0, y: 0}
        this.pos = start_pos;
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
        if(board[this.pos.y+1][this.AllowedMoves.x] === 0) {
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
        this.open_space = true
        this.buffer_x = 0
        this.buffer_y = 0
        this.count = 0
        this.pos_list = []
        this.possibilities = [{x: -1, y: 1, piece: true}, {x: -1, y: -1, piece: true}, {x: 1, y: 1, piece: true}, {x: 1, y: -1, piece: true}] //index 0 is left up, index 1 is left down, index 2 is right up, index 3 is right down 
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "bishop");
    }


    AllowedMoves()
    {
        while(this.open_space === true){
            this.buffer_x += 1
            this.buffer_y +=1
            this.count = 0 
            for(let i = 0; i<this.list.length;i++){
                if(this.possibilities[i].piece === true){
                    if(board[this.pos.y+this.buffer_x*this.list[i].y][this.pos.x+this.buffer_x*this.list[i].x] === 0){
                        this.pos_list.push({x: this.pos.x+this.buffer_x*this.list[i].x, y: this.pos.y+this.buffer_x*this.list[i].y})
                    } else if(board[this.pos.y+this.buffer_y*this.possibilities[i].y][this.pos.x+this.buffer_x*this.possibilities[i].x] === 1){
                        this.possibilities[i].piece = false
                        this.count += 1
                        this.capture_pos.push({x: this.pos.x+this.buffer_x*this.possibilities[i].x, y: this.pos.y+this.buffer_y*this.possibilities[i].y})
                    } else{
                        this.possibilities[i].piece = false
                        this.count += 1
                    }
                }
            }
            if(this.count === 4){
                this.open_space = false
            }
        }
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
        this.capture_pos = []
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
            } else if(x >= 0 && x < 8 && y < 8 && board[x][y] === 1){
                this.capture_pos.push({x: x, y: y})
            }
        }
    }
}



export class Rook extends Piece
{
    constructor()
    {
        super(start_pos, color)
        this.open_space = false
        this.buffer_x = 0
        this.buffer_y = 0
        this.count = 0
        this.pos_list = []
        this.capture_pos = []
        this.possibilities = [{x: 1, y: 0, piece: true}, {x: -1, y: 0, piece: true}, {x: 0, y: 1, piece: true}, {x: 0, y: -1, piece: true}] 
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "rook");
    }
    Allowedmoves(){
        while (this.open_space === true){
            this.buffer_x += 1
            this.buffer_y += 1
            this.count = 0
            for(let i = 0;i<this.possibilities.length;i++){
                if(board[this.pos.y+this.buffer_y*this.possibilities[i].y][this.pos.x+this.buffer_x*this.possibilities[i].x] === 0){
                    this.pos_list.push({x: this.pos.x+this.buffer_x*this.possibilities[i].x, y: this.pos.y+this.buffer_y*this.possibilities[i].y})
                } else if(board[this.pos.y+this.buffer_y*this.possibilities[i].y][this.pos.x+this.buffer_x*this.possibilities[i].x] === 1){
                    this.possibilities[i].piece = false
                    this.count += 1
                    this.capture_pos.push({x: this.pos.x+this.buffer_x*this.possibilities[i].x, y: this.pos.y+this.buffer_y*this.possibilities[i].y})
                } else{
                    this.possibilities[i].piece = false
                    this.count += 1
                }
                if(this.count === 4){
                    this.open_space = false
                }
            }
        }
    }
}



export class Queen extends Piece
{
    constructor()
    {
        super(start_pos, color)
        this.open_space = false
        this.buffer_x = 0
        this.buffer_y = 0
        this.count = 0
        this.pos_list = []
        this.capture_pos = []
        this.possibilities = [{x: -1, y: 0, piece: true}, {x: -1, y: 1, piece: true}, {x: -1, y: -1, piece: true}, {x:0, y:-1, piece: true}, {x:0, y:1, piece:true}, {x:1,y:1,piece:true}, {x:1,y:0,piece:true}, {x:1,y:-1,piece:true}] 
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "queen");
        while(open_space === true){
            this.buffer_x += 1
            this.buffer_y += 1
            this.count = 0
            for(let i = 0; i<this.possibilities.length;i++){
                if(board[this.pos.y+this.buffer_y*this.possibilities[i].y][this.pos.x+this.buffer_x*this.possibilities[i].x] === 0){
                    this.pos_list.push({x: this.pos.x+this.buffer_x*this.possibilities[i].x, y: this.pos.y+this.buffer_y*this.possibilities[i].y})
                } else if(board[this.pos.y+this.buffer_y*this.possibilities[i].y][this.pos.x+this.buffer_x*this.possibilities[i].x] === 1){
                    this.possibilities[i].piece = false
                    this.count += 1
                    this.capture_pos.push({x: this.pos.x+this.buffer_x*this.possibilities[i].x, y: this.pos.y+this.buffer_y*this.possibilities[i].y})
                }
                else{
                    this.possibilities[i].piece = false
                    this.count += 1
                }
            }
        }
        if(this.count === 4){
            this.open_space = false
        }
    }
}




export class King extends Piece
{
    constructor()
    {
        super(start_pos, color)
        this.open_space = false
        this.buffer_x = 0
        this.buffer_y = 0
        this.count = 0
        this.pos_list = []
        this.capture_pos = []
        this.possibilities = [{x: -1, y: 0, piece: true}, {x: -1, y: 1, piece: true}, {x: -1, y: -1, piece: true}, {x:0, y:-1, piece: true}, {x:0, y:1, piece:true}, {x:1,y:1,piece:true}, {x:1,y:0,piece:true}, {x:1,y:-1,piece:true}] 
    }


    draw(context, piecesize)
    {
        this._draw(context, piecesize, "king");
    }
    AllowedMoves(){
        for(let i =0;i <this.possibilities.length;i++){
            if(board[this.pos.y+1*this.possibilities[i].y][this.pos.x+1*this.possibilities[i].x] === 0){
                this.pos_list.push({x: this.pos.x+1*this.possibilities[i].x, y: this.pos.y+1*this.possibilities[i].y})
            } else if(board[this.pos.y+this.buffer_y*this.possibilities[i].y][this.pos.x+this.buffer_x*this.possibilities[i].x] === 1){
                this.capture_pos.push({x: this.pos.x+this.buffer_x*this.possibilities[i].x, y: this.pos.y+this.buffer_y*this.possibilities[i].y})
            }
        }
    }
}