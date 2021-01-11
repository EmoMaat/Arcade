function setWave() {
	//set wave multiplier:
	self = missileCommandGame;
		if (self.wave == 1) {
			self.waveMultiplier = 1;						//score multiplier
			self.timerMin = 230;
			self.timerMax = 450;
			self.missileTimerMax = randomNumber(self.timerMin, self.timerMax);	//limit for missileTimer
			self.missileAmount = randomNumber(2,6); 		//random number between 1 and 5, each time missileTimer reaches amount, spawn 1 to 4 missiles.
			self.missilesPerWave = 8; 						//set the max missiles allowed per wave
			self.speedMultiplier = 1;						//multiplier for all missileSpeeds
			
			self.planeChance = 0;
			self.sateliteChance = 0;
			self.smartBombChance = 0;
			
			self.firstWaveMissiles = 4;
			self.firstWavePlanes = 0;
			self.firstWaveSatelites = 0;
		} else if (self.wave == 2) {
			self.waveMultiplier = 1;							//score multiplier	
			self.timerMin = 230;
			self.timerMax = 450;
			self.missileTimerMax = randomNumber(self.timerMin, self.timerMax);	//limit for missileTimer
			self.missileAmount = randomNumber(2,6); 		//random number between 1 and 5, each time missileTimer reaches amount, spawn 1 to 4 missiles.
			self.missilesPerWave = 8; 						//set the max missiles allowed per wave
			self.speedMultiplier = 1;						//multiplier for all missileSpeeds
			
			self.planeChance = 0;
			self.sateliteChance = 0.00082;
			self.smartBombChance = 0;
			
			self.firstWaveMissiles = 3;
			self.firstWavePlanes = 0;
			self.firstWaveSatelites = 1;
		} else if (self.wave == 3 || self.wave == 4) {
			self.waveMultiplier = 2;
			
			self.timerMin = 230;
			self.timerMax = 450;
			self.missileTimerMax = randomNumber(self.timerMin, self.timerMax);	//limit for missileTimer
			self.missileAmount = randomNumber(2,6); 		//random number between 1 and 5, each time missileTimer reaches amount, spawn 1 to 4 missiles.
			self.missilesPerWave = 8; 						//set the max missiles allowed per wave
			self.speedMultiplier = 1.2;						//multiplier for all missileSpeeds
			self.explosionSpeedMultiplier = 1.15;
			
			self.planeChance = 0.00042;
			self.sateliteChance = 0.000395;
			self.smartBombChance = 0;
			
			self.firstWaveMissiles = 4;
			self.firstWavePlanes = 0;
			self.firstWaveSatelites = 1;
		} else if (self.wave == 5 || self.wave == 6) {
			self.waveMultiplier = 3;
			
			self.timerMin = 230;
			self.timerMax = 450;
			self.missileTimerMax = randomNumber(self.timerMin, self.timerMax);	//limit for missileTimer
			self.missileAmount = randomNumber(2,6); 		//random number between 1 and 5, each time missileTimer reaches amount, spawn 1 to 4 missiles.
			self.missilesPerWave = 8; 						//set the max missiles allowed per wave
			self.speedMultiplier = 1.55;						//multiplier for all missileSpeeds
			
			self.planeChance = 0.00048;
			self.sateliteChance = 0.000395;
			self.smartBombChance = 0.00049;
			self.explosionSpeedMultiplier = 1.45;
			self.smartBombAmount = 1;
			
			self.firstWaveMissiles = 4;
			self.firstWavePlanes = 1;
			self.firstWaveSatelites = 0;
		} else if (self.wave == 7 || self.wave == 8) {
			self.waveMultiplier = 4;
			
			self.timerMin = 230;
			self.timerMax = 450;
			self.missileTimerMax = randomNumber(self.timerMin, self.timerMax);	//limit for missileTimer
			self.missileAmount = randomNumber(2,6); 		//random number between 1 and 5, each time missileTimer reaches amount, spawn 1 to 4 missiles.
			self.missilesPerWave = 9; 						//set the max missiles allowed per wave
			self.speedMultiplier = 1.7;						//multiplier for all missileSpeeds
			self.explosionSpeedMultiplier = 1.7;
			
			self.planeChance = 0.0005;
			self.sateliteChance = 0.0004;
			self.smartBombChance = 0.00053;
			self.smartBombAmount = 1;
			
			self.firstWaveMissiles = 4;
			self.firstWavePlanes = 0;
			self.firstWaveSatelites = 1;
		} else if (self.wave == 9 || self.wave == 10) {
			self.waveMultiplier = 5;
			
			self.timerMin = 230;
			self.timerMax = 450;
			self.missileTimerMax = randomNumber(self.timerMin, self.timerMax);	//limit for missileTimer
			self.missileAmount = randomNumber(2,6); 		//random number between 1 and 5, each time missileTimer reaches amount, spawn 1 to 4 missiles.
			self.missilesPerWave = 9; 						//set the max missiles allowed per wave
			self.speedMultiplier = 1.8;						//multiplier for all missileSpeeds
			self.explosionSpeedMultiplier = 1.8;
			
			self.planeChance = 0.00054;
			self.sateliteChance = 0.00043;
			self.smartBombChance = 0.00061;
			self.smartBombAmount = randomNumber(2,3);
			
			self.firstWaveMissiles = 3;
			self.firstWavePlanes = 1;
			self.firstWaveSatelites = 1;
		} else if (self.wave >= 11) {
			self.waveMultiplier = 6;
			
			self.timerMin = 215;
			self.timerMax = 300;
			self.missileTimerMax = randomNumber(self.timerMin, self.timerMax);	//limit for missileTimer
			self.missileAmount = randomNumber(2,7); 		//random number between 1 and 5, each time missileTimer reaches amount, spawn 1 to 4 missiles.
			self.missilesPerWave = 10; 						//set the max missiles allowed per wave
			self.speedMultiplier = 2;					//multiplier for all missileSpeeds
			self.explosionSpeedMultiplier = 1.9;
			
			self.planeChance = 0.00055;
			self.sateliteChance = 0.00048;
			self.smartBombChance = 0.0007;
			self.smartBombAmount = randomNumber(2,3);
			
			self.firstWaveMissiles = 4;
			self.firstWavePlanes = 1;
			self.firstWaveSatelites = 1;
		}
}