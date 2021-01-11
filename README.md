# Arcade
Javascript / HTML code for creating an arcade environment

## Sturcture
The [lib](https://github.com/EmoMaat/Arcade/tree/master/lib)/pagecontroller.js is purely for initialization but should be loaded first.  
The [lib](https://github.com/EmoMaat/Arcade/tree/master/lib)/hub.js loads the hub and will therefore start the UI.  
The game each has its perspective folder in the root

## Hub Integration
Adding an item to the hub has only 2 steps:
* Located in [lib](https://github.com/EmoMaat/Arcade/tree/master/lib)/pagecontroller.js there is a variable called games, where you should type the name of your game. 
- Optional image: The name specified in the "games" variable should be made lowercase, has it spaces removed and put as .png in the  src folder located in the [lib](https://github.com/EmoMaat/Arcade/tree/master/lib) folder.

- loading: _The name specified in the ```games``` variable, when executed, has its spaces removed. This will be be the starting point of your game. Example: Pac Man => PacMan => executable: ```PacMan()```_

## Game Integration
Each game must support the following classes (found in [lib](https://github.com/EmoMaat/Arcade/tree/master/lib)/classes.js):
- MenuOverlay => Creates an instance of the game without the user being able to play, only able to select options
- EscOverlay => When the ESC button is activated an overlay is created and the game is paused
- Inverval => _Replaces ```setInterval``` with ```Interval()``` and ```clearInterval``` with  with ```Interval.stop();```_ **EscOverlay Dependancy**

Each game must assign at least the following variables and functions:
- update() => the main update function
- gameInterval as its main interval, which should be pausable

### Keypress Registering  
The registering of keypresses is done automatically.  
By default, a keypress and hold will only be registered as one press. To disable this feature use the following line:
```
move.smooth = true;
```
The ```move``` object has four movements:
- left (move.left)
- right (move.right)
- down (move.down)
- up (move.up)

**Multiplayer**  
The ```move``` object also has _multiplayer (two players)_ support:
- can be enabled with the following line:
```
move.multiplayer = true;
```
- works the same as the normal move system, but you must add ```p1``` or ```p2```. For example: ```move.p1.left```
- ```move.p[EITHER 1 OR 2].keybinding``` lets you select the keys they will listen to
