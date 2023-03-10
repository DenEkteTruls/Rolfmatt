const time = new Date().getTime();


let minutes_left = 10;
let number_time = minutes_left*60
var myFunc = setInterval(function(){ 
   

    let seconds_left = 0;
    let now = new Date().getTime();
    let timeleft = now - time;

    let seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
    number_time -= 1

    seconds_left = 60-seconds  

    if(number_time%60 === 0){
        minutes_left = number_time/60
    }
    console.log(minutes_left, seconds_left)
},1000)