//Map sizing, in pixals
const TILE_SIZE = 64;
const WALL_WIDTH = 1;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const MINI_MAP_SCALE_FACTOR = 0.2;


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
        this.distance = 0;
        
        this.wasHitVert = false;
        
        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;
        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }

   cast(columnId) {
        var xintercept, yintercept;
        var xstep, ystep;

        ///////////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION CODE
        ///////////////////////////////////////////
        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;

        // Find the y-coordinate of the closest horizontal grid intersenction
        yintercept = Math.floor(gamePlayer.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

        // Find the x-coordinate of the closest horizontal grid intersection
        xintercept = gamePlayer.x + (yintercept - gamePlayer.y) / Math.tan(this.rayAngle);

        // Calculate the increment xstep and ystep
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        var nextHorzTouchX = xintercept;
        var nextHorzTouchY = yintercept;

        // Increment xstep and ystep until we find a wall
        while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
            if (gameMap.hasWall(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
                break;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }
        
        ///////////////////////////////////////////
        // VERTICAL RAY-GRID INTERSECTION CODE
        ///////////////////////////////////////////
        var foundVertWallHit = false;
        var vertWallHitX = 0;
        var vertWallHitY = 0;

        // Find the x-coordinate of the closest vertical grid intersenction
        xintercept = Math.floor(gamePlayer.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

        // Find the y-coordinate of the closest vertical grid intersection
        yintercept = gamePlayer.y + (xintercept - gamePlayer.x) * Math.tan(this.rayAngle);

        // Calculate the increment xstep and ystep
        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        var nextVertTouchX = xintercept;
        var nextVertTouchY = yintercept;

        // Increment xstep and ystep until we find a wall
        while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
            if (gameMap.hasWall(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                break;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        // Calculate both horizontal and vertical distances and choose the smallest value
        var horzHitDistance = (foundHorzWallHit)
            ? distanceBetweenPoints(gamePlayer.x, gamePlayer.y, horzWallHitX, horzWallHitY)
            : Number.MAX_VALUE;
        var vertHitDistance = (foundVertWallHit)
            ? distanceBetweenPoints(gamePlayer.x, gamePlayer.y, vertWallHitX, vertWallHitY)
            : Number.MAX_VALUE;

        // only store the smallest of the distances
        this.wallHitX = (horzHitDistance < vertHitDistance) ? horzWallHitX : vertWallHitX;
        this.wallHitY = (horzHitDistance < vertHitDistance) ? horzWallHitY : vertWallHitY;
        this.distance = (horzHitDistance < vertHitDistance) ? horzHitDistance : vertHitDistance;
        this.wasHitVertical = (vertHitDistance < horzHitDistance);
    }
    render() {
        stroke("rgba(255, 0, 0, 1.0)");
        line(
            MINI_MAP_SCALE_FACTOR * gamePlayer.x,
            MINI_MAP_SCALE_FACTOR * gamePlayer.y,
            MINI_MAP_SCALE_FACTOR * this.wallHitX,
            MINI_MAP_SCALE_FACTOR * this.wallHitY
        );
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
                rect(MINI_MAP_SCALE_FACTOR * titleX, MINI_MAP_SCALE_FACTOR * titleY, 
                    MINI_MAP_SCALE_FACTOR * TILE_SIZE, MINI_MAP_SCALE_FACTOR * TILE_SIZE);
            }
        }
    }
}

class Player {
    
    constructor(){ // memeber variables
        this.x = WINDOW_WIDTH / 2; //pixal X
        this.y = WINDOW_HEIGHT / 7;// pixal Y
        this.radius = 4; // pixels
        this.turnDirection = 0; // -1 for left, +1 for right
        this.walkDirection = 0; // -1 for down, +1 for up
        this.rotationAngle = Math.PI / 2; // from dergrees to radians
        this.moveSpeed = 2.0; 
        this.rotationSpeed = 3 * (Math.PI/180); // 2 degrees to radians "RotationSpeed is 2 degrees per frame
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
        circle(MINI_MAP_SCALE_FACTOR *this.x, MINI_MAP_SCALE_FACTOR * this.y, MINI_MAP_SCALE_FACTOR *this.radius);
       /* stroke("red");
        line(
            this.x, this.y, 
            this.x + Math.cos(this.rotationAngle) * 20,
            this.y + Math.sin(this.rotationAngle) * 20);
        */
    }
}

var gameMap = new Map();
var gamePlayer = new Player();
var rays = [];


function distanceBetweenPoints(x1,y1,x2,y2){

    return Math.sqrt((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1));
}

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

function render3DProjectedWalls(){
    for(var i = 0; i < NUM_RAYS; i++){
        //current ray
        var ray = rays[i];
        var perpdicularDist = ray.distance * Math.cos(ray.rayAngle - gamePlayer.rotationAngle);
        
        var distFromPlayerToProjection =  (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);        
        //Projected wall height
        var wallStripHeight = (TILE_SIZE / perpdicularDist) * distFromPlayerToProjection; 

        fill("rgba(255,255,255,255)")
        noStroke();

        rect(i * WALL_WIDTH, 
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
            WALL_WIDTH,
            wallStripHeight
        );
    }
}

function castAllRays(){
    var columnID = 0; // 0 - how many rays I have;
    
    //Start first ray(left most side) by subtracting FOV
    var rayAngle = gamePlayer.rotationAngle - (FOV_ANGLE / 2);

    //clearing out old rays
    rays = [];

    for(var i = 0; i < NUM_RAYS; i++){
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
    castAllRays();
}

function draw(){
    clear("#212121");
    update();
    
    render3DProjectedWalls();

    gameMap.render();
    for(ray of rays){
        ray.render();
    }
    gamePlayer.render();
}