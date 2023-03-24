

export class Networking
{
    constructor()
    {
        this.database = firebase.database();
    }


    create_game(gameID)
    {
        let meta = {
            'white' :   'player1',
            'black' :   'player2',
            'time'  :   '120',
            'moves' :   []
        };
        this.database.ref("games/"+gameID+"/").set(meta);
    }


    send_piecemove(gameID, old_pos, new_pos) {
        this.database.ref("games/"+gameID+"/moves").push().set({
            'old_pos': old_pos,
            'new_pos': new_pos
        });
    }
}