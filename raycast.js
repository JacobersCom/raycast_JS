//Map sizing, in pixals
const TILE_SIZE = 32;
const WALL_WIDTH = 1;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

//player filed of view
const FOV_ANGLE = 60 * (Math.PI / 180);

//Window sizing
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
//Ray const
const NUM_RAYS = WINDOW_WIDTH / WALL_WIDTH;

class Ray{
    constructor(rayAngle){
        this.rayAngle = normalAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        //distance between player and wallhitX and Y
        this.distance = 0;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;
        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }

    cast(columnID){

        // Just copy and paste the horz code for the vertical code and than compair the two

        //point where the ray intercepts the X-axis or Y-axis
        var shortXIntercept, shortYIntercpet, longYIntercpet, longXIntercpet;
        //The space between each horizontal or vertical intersection
        var shortX, shortY, longX, longY;
        //Did we hit a wall?
        var foundHorzWallHit = false;
        var foundVertWallHit = false;
        //The hit wall's X and Y coordniates
        var shortWallHitX = 0;
        var shortWallHitY = 0;
        var longWallHitX = 0;
        var longWallHitY = 0;

        longXIntercpet = Math.floor(gamePlayer.x /TILE_SIZE) * TILE_SIZE;
        longXIntercpet += this.isRayFacingRight ? TILE_SIZE : 0;
        
        longYIntercpet = longXIntercpet - gamePlayer.x;
        longYIntercpet = longYIntercpet / Math.tan(this.rayAngle);
        longYIntercpet = gamePlayer.y + longYIntercpet
        
        longX = TILE_SIZE;
        longY = longX / tan(this.rayAngle);

        longY *= (this.isRayFacingDown && longY < 0) ? -1 : 1
        longY *= (this.isRayFacingUp && longY > 0) ? -1 : 1

        var nextVertTouchX = longXIntercpet;
        var nextVertTouchY = longYIntercpet;

        //Horizontal intersection code


        //find the y coordinate of the closest horizontal grid intersection
        shortYIntercpet = Math.floor(gamePlayer.y / TILE_SIZE) * TILE_SIZE;  
        
        //if ray is pointing down. Add 32 to get to the next horizontal line
        shortYIntercpet += this.isRayFacingDown ? TILE_SIZE : 0;
        
        //find the x coordinate of the closets horizontal gird intersection
        shortXIntercept = shortYIntercpet - gamePlayer.y;
        shortXIntercept = shortXIntercept / Math.tan(this.rayAngle);
        shortXIntercept = gamePlayer.x + shortXIntercept;

        //Calculate the increment of xstep and ystep (Finding delta X)
        shortY = TILE_SIZE;
        //Because in graphics Y is inverted. When facing up we are negitive, when down we are positive.
        shortY *= this.isRayFacingUp ? -1 : 1;

        shortX = shortY / Math.tan(this.rayAngle);
        //If the ray is facing left, make sure the step is also on the left
        shortX *= (this.isRayFacingLeft && shortX > 0) ? -1 : 1;
        //if the ray is facing right, make sure the step is also on the right
        shortX *= (this.isRayFacingRight && shortX < 0) ? -1 : 1;


        var nextHorzTouchX = shortXIntercept;
        var nextHorzTouchY = shortYIntercpet;

        if(this.isRayFacingUp){
            nextHorzTouchY--;
        }

        //increment xstep and ystep till we find a wall

        while(nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {

            if(gameMap.hasWall(nextHorzTouchX, nextHorzTouchY)){
                foundHorzWallHit = true;
                shortWallHitX = nextHorzTouchX;
                shortWallHitY = nextHorzTouchY;
                
                stroke("red")
                line(gamePlayer.x, gamePlayer.y, shortWallHitX, shortWallHitY);
                break;

        }

    }

    render(){
        stroke("rgba(255,0,0,0.3)");
        line(gamePlayer.x, gamePlayer.y, 
            gamePlayer.x + Math.cos(this.rayAngle) * 30,
            gamePlayer.y + Math.sin(this.rayAngle) * 30);
    }

}

class Map{
    constructor(){
        this.grid = [
            
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]


        ];
    }

    hasWall(x, y){
        
        if(x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT){
            return true;
        }

       var mapGridIndexX = Math.floor(x / TILE_SIZE); // turns the player x from a pixal cord to a index value
       var mapGridIndexY = Math.floor(y / TILE_SIZE); // turns the player y from pixal cord to a index value
       return this.grid[mapGridIndexY][mapGridIndexX] != 0;

    }

    render(){
        for(var i = 0; i < MAP_NUM_ROWS; i++){
            for(var j = 0; j < MAP_NUM_COLS; j++){
                
                var titleX = j * TILE_SIZE;
                var titleY = i * TILE_SIZE;
                var titleColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(titleColor);
                rect(titleX, titleY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

class player {
    
    constructor(){ // memeber variables
        this.x = WINDOW_WIDTH / 2; //pixal X
        this.y = WINDOW_HEIGHT / 2;// pixal Y
        this.radius = 3; // pixels
        this.turnDirection = 0; // -1 for left, +1 for right
        this.walkDirection = 0; // -1 for down, +1 for up
        this.rotationAngle = Math.PI / 2; // from dergrees to radians
        this.moveSpeed = 2.0; 
        this.rotationSpeed = 2 * (Math.PI/180); // 2 degrees to radians "RotationSpeed is 2 degrees per frame
    }

    update(){ // updates player position
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        var moveStep = this.walkDirection * this.moveSpeed; // 0 if not moving, 2 if moving forward, -2 two if moving backwards
        var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep; // The next position of the player in the X
        var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep; // The next position of the player in the Y
        
        if(!gameMap.hasWall(newPlayerX, newPlayerY)){
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
    
    render(){ //Creates the player on the screen
        noStroke();
        fill("blue");
        circle(this.x, this.y, this.radius);
       /* stroke("red");
        line(
            this.x, this.y, 
            this.x + Math.cos(this.rotationAngle) * 20,
            this.y + Math.sin(this.rotationAngle) * 20);
        */
    }
}

var gameMap = new Map();
var gamePlayer = new player();
var rays = [];


function normalAngle(angle){
    angle = angle % (2 * Math.PI);
    if(angle < 0){
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}


function keyPressed(){ // handles key presses
    if(keyCode == UP_ARROW){
        gamePlayer.walkDirection = +1; // walking forward
    } else if (keyCode == DOWN_ARROW){
        gamePlayer.walkDirection = -1; //walking backwards
    } else if (keyCode == RIGHT_ARROW){
        gamePlayer.turnDirection = +1; //turning right
    } else if (keyCode == LEFT_ARROW){
        gamePlayer.turnDirection = -1; //turning left
    }
}

function keyReleased(){ // handles key releases
     
    if(keyCode == UP_ARROW){
        gamePlayer.walkDirection = 0; // walking forward
    } else if (keyCode == DOWN_ARROW){
        gamePlayer.walkDirection = 0; //walking backwards
    } else if (keyCode == RIGHT_ARROW){
        gamePlayer.turnDirection = 0; //turning right
    } else if (keyCode == LEFT_ARROW){
        gamePlayer.turnDirection = 0; //turning left
    }
}

function castAllRays(){
    var columnID = 0; // 0 - how many rays I have;
    
    //Start first ray(left most side) by subtracting FOV
    var rayAngle = gamePlayer.rotationAngle - (FOV_ANGLE / 2);

    //clearing out old rays
    rays.length = 0;

    for(var i = 0; i < 1; i++){
        //Creating a ray
        var ray = new Ray(rayAngle);
        ray.cast(columnID);
        rays.push(ray);
        
        //the angle of the next ray
        rayAngle += FOV_ANGLE / NUM_RAYS;

        columnID++;
    }

}

function setup(){
    //TODO: initializee all objects. Runs once
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update(){ // Pre frame.
    gamePlayer.update();
}

function draw(){
    update();
    
    gameMap.render();
    for(ray of rays){
        ray.render();
    }
    gamePlayer.render();
    castAllRays();
}