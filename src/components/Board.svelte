<script>
    import {Board} from '../js/Board.js';
    import { Canvas, Layer, t } from 'svelte-canvas';

    let board = new Board();

    function clicked(event)
    {
        let x = event.clientX - 288;
        let y = event.clientY - 30;

        board.update_mouse_pos(x, y);
    }


    $: render = ({ context, width, height }) => {
        context.clearRect(0, 0, width, height);
        let last_color = 1;
        for(let y = 0; y < 8; y++) {
            
            last_color = !last_color

            //drawing board
            for(let x = 0; x < 8; x++) {
                context.fillStyle = (last_color ? board.dark_color : board.light_color);
                if(board.board[y][x] == 1) {
                    context.fillStyle = "red";
                }
                context.fillRect(x * board.pieceSize, y * board.pieceSize, board.pieceSize, board.pieceSize);
                last_color = !last_color

                //drawing characters
                context.fillStyle = (last_color ? board.dark_color : board.light_color);
                context.font = "20px Arial";
                context.fillText(String.fromCharCode(97 + x), (board.pieceSize * x+55), (board.pieceSize * 8 - 10));
            }

            // drawing numbers
            context.fillStyle = (!last_color ? board.dark_color : board.light_color);
            context.font = "20px Arial";
            context.fillText(8-y, 5, (board.pieceSize * y)+25);
        }

        board.addPieces(context);
    };
</script>



<div class="container">
    <Canvas width={600} height={600} on:mousedown={clicked}>
        <Layer {render}/>
    </Canvas>
</div>



<style>

</style>