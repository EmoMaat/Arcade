//load all sounds
var astExp1 = new Audio();
var astExp2 = new Audio();
var astExp3 = new Audio();
var astFire = new Audio();
var astLife = new Audio();
var astLSaucer = new Audio();
var astSSaucer = new Audio();
var astSFire = new Audio();
var astThrust = new Audio();
var astThumpHi = new Audio();
var astThumpLo = new Audio();

//set all sound sources
astExp1.src = "Asteroids/src/explode1.wav";
astExp2.src = "Asteroids/src/explode2.wav";
astExp3.src = "Asteroids/src/explode3.wav";
astFire.src = "Asteroids/src/fire.wav";
astLife.src = "Asteroids/src/life.wav";
astLSaucer.src = "Asteroids/src/lsaucer.wav";
astSSaucer.src = "Asteroids/src/ssaucer.wav";
astSFire.src = "Asteroids/src/sfire.wav";
astThrust.src = "Asteroids/src/thrust.wav";
astThumpHi.src = "Asteroids/src/thumphi.wav";
astThumpLo.src = "Asteroids/src/thumplo.wav";

//adjust volume
astFire.volume = 0.3;
astThumpHi.volume = 0.5;
astThumpLo.volume = 0.5;
astSFire.volume = 0.3;
astSSaucer.volume = 0.6;

//load all images
var astTitle = new Image();
var astLife = new Image();

//load all image sources
astTitle.src = "Asteroids/src/title_text.png";
astLife.src = "Asteroids/src/tri.png";