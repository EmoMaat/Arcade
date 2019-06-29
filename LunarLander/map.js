class LunarLanderMap{
    constructor(){
        this.map = [];

        this.MAX_HEIGHT = window.height;
        this.MAX_SLOPE = 2.5;
    }

    vector(posX, posY){
        return new Object({x:posX, y:posY});
    }
}