//audio
var pacmanChomp = new Audio();
var pacmanDeath = new Audio();
var pacmanGhosteaten = new Audio();
var pacmanReady= new Audio();
var pacmanBgsound= new Audio();

pacmanReady.addEventListener("ended", function(){
    pacmanReady.currentTime = 0;
    pacmanReady.pause();
    arcade.game.object.ready.state = true;
});

//sources

pacmanChomp.src = "PacMan/src/chomp.wav"
pacmanDeath.src = "PacMan/src/death.wav"
pacmanGhosteaten.src = "PacMan/src/ghosteat.wav"
pacmanReady.src = "PacMan/src/ready.wav"
pacmanBgsound.src = "PacMan/src/bgsound.wav"