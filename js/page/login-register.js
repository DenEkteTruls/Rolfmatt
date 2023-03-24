

firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        window.location.href = "game.html";
    } else {
        console.log("not");
    }
});

function login()
{
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
}


function register()
{

}