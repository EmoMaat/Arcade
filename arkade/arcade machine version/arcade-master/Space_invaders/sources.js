//images

var alien1 = new Image();
var alien2 = new Image();
var alien3 = new Image();
var mother_ship = new Image();
var cannonImg = new Image();
var bunker_block = new Image();
var bunker_block_slanted = new Image();
var projectile1 = new Image();
var projectile2 = new Image();
var cannon_explosion = new Image();
var alien_explosion = new Image();

//image sources

alien1.src = "Space_invaders/src/alien1.png";
alien2.src = "Space_invaders/src/alien2.png";
alien3.src = "Space_invaders/src/alien3.png";
mother_ship.src = "Space_invaders/src/mothership.png";
cannonImg.src = "Space_invaders/src/cannon.png";
bunker_block.src = "Space_invaders/src/bunker_block.png";
bunker_block_slanted.src = "Space_invaders/src/bunker_block_slanted.png";
projectile1.src = "Space_invaders/src/projectile1.png";
projectile2.src = "Space_invaders/src/projectile2.png";
cannon_explosion.src = "Space_invaders/src/cannon_explosion.png";
alien_explosion.src = "Space_invaders/src/explosion.png";

//audio

var beep1 = new Audio();
var beep2 = new Audio();
var beep3 = new Audio();
var beep4 = new Audio();
var alienFire = new Audio();
var alienDestroy = new Audio();
var explosionSound = new Audio();
var shootSound = new Audio();
var lowPitchUfo = new Audio();

//audio sources

beep1.src = "Space_invaders/src/beep1.wav";
beep2.src = "Space_invaders/src/beep2.wav";
beep3.src = "Space_invaders/src/beep3.wav";
beep4.src = "Space_invaders/src/beep4.wav";
alienFire.src = "Space_invaders/src/alien_fire.wav";
alienDestroy.src = "Space_invaders/src/alien_destroy.wav";
explosionSound.src = "Space_invaders/src/explosion.wav";
shootSound.src = "Space_invaders/src/shoot.wav";
lowPitchUfo.src = "Space_invaders/src/ufo_lowpitch.wav";

//audio volume corrections

alienDestroy.volume = 0.5;
shootSound.volume = 0.5;
lowPitchUfo.volume = 0.1;