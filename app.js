let lastRenderTime = 0;
let speed = 2; // times the snake move per second
const gameBoard = document.getElementById("gameBoard");
let isGameOver = false;

let level = 1;
let score = 0;

function main(currentTime){
    if(isGameOver){
        if(confirm("Game Over. Press ok to restart!")){
            window.location = '/snake_game/'; // refresh the page -- restart the game
        }
        return;
    }

    window.requestAnimationFrame(main);
    // it changes approximately every 0.06 seconds
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000; // to seconds
    
    if(secondsSinceLastRender < 1 / speed){
        return;
    }

    lastRenderTime = currentTime;

    update();
    if(!isGameOver){
        draw();
    }
}

// start the loop
window.requestAnimationFrame(main);

function update(){
    updateSnake();
    updateFood();
    checkGameOver();
}

function draw(){
    // clear all previous divs we drew.
    gameBoard.innerHTML = "";
    // new drawing gameboard
    drawSnake(gameBoard);
    drawFood(gameBoard);
}

//------------------------------------------------------------------------
// for snake
const snakeBody = [{x:11,y:11}];
let newSegments = 0;

function updateSnake(){
    addSegments();

    // input direction
    const inputDirection = getInputDirection();

    // get second to last element - because the last element will need to disappear
    // this loop gets all elements except the head element
    for(let i = snakeBody.length - 2; i >= 0; i--){
        snakeBody[i + 1] = {...snakeBody[i]}
    }

    snakeBody[0].x += inputDirection.x;
    snakeBody[0].y += inputDirection.y;

}

function drawSnake(gameBoard){
    snakeBody.forEach(segment =>{
        const snakeElement = document.createElement("div");
        snakeElement.style.gridRowStart = segment.y;
        snakeElement.style.gridColumnStart = segment.x;

        snakeElement.classList.add("snake");
        gameBoard.appendChild(snakeElement);
    })
}

// check if the snake is overlapped with the food or itself
function onSnake(position, {ignoreHead = false} = {}){
    return snakeBody.some((segment, index) =>{ // for any element in snakeBody
        if(ignoreHead && index === 0) return false;
        return equalPositions(segment,position);
    })
}

function equalPositions(pos1, pos2){
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

function expandSnake(amount){
    newSegments += amount;
}

function addSegments(){
    for(let i = 0; i < newSegments; i++){
        snakeBody.push({ ...snakeBody[snakeBody.length - 1]});
    }
    newSegments = 0;
}

//------------------------------------------------------------------------
let food = getRandomFoodPosition();
let expansion_rate = 1; // how much the snake is grawing

let printScore = document.getElementById("score");
let printLevel = document.getElementById("level");

// for food
function updateFood(){
    if(onSnake(food)){
        score += 100;
        if(score < 1000)
            printScore.innerText = `00${score}`;
        else if(score < 10000)
            printScore.innerText = `0${score}`;

        if(score === 800){
            level = 2;
            speed = 4;
            printLevel.innerText = level;
        }
        else if(score === 1500){
            level = 3;
            speed = 6;
            printLevel.innerText = level;
        }
        else if(score === 3000){
            level = 4;
            speed = 8;
            printLevel.innerText = level;
        }
        else if(score === 6000){
            level = 5;
            speed = 10;
            printLevel.innerText = level;
        }

        expandSnake(expansion_rate);
        food = getRandomFoodPosition();
    }
}

function drawFood(gameBoard){
    const foodElement = document.createElement("div");
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;

    foodElement.classList.add("food");
    gameBoard.appendChild(foodElement);
}

function getRandomFoodPosition(){
    let newFoodPosition;
    while(newFoodPosition == null || onSnake(newFoodPosition)){
        newFoodPosition = randomGridPosition();
    }
    return newFoodPosition;
}

function randomGridPosition(){
    return {x:Math.floor(Math.random() * 21) + 1, y:Math.floor(Math.random() * 21) + 1};
}

//------------------------------------------------------------------------
// input variables
let inputDirection = {x:0, y:0};
let lastDirection = {x:0, y:0};

window.addEventListener("keydown", e =>{
    switch(e.key){
        case 'w':
        case "ArrowUp":
            // if we are moving up, we cannot move down directly
            if(lastDirection.y !== 0) break
            inputDirection = {x:0, y:-1};
            break;
        case 's':
        case "ArrowDown":
            if(lastDirection.y !== 0) break
            inputDirection = {x:0, y:1};
            break;
        case 'a':
        case "ArrowLeft":
            if(lastDirection.x !== 0) break
            inputDirection = {x:-1, y:0};
            break;
        case 'd':
        case "ArrowRight":
            if(lastDirection.x !== 0) break
            inputDirection = {x:1, y:0};
            break;
    }
})

function getInputDirection(){
    lastDirection = inputDirection;
    return inputDirection;
}

//------------------------------------------------------------------------
function checkGameOver(){
    isGameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
}

function outsideGrid(position){
    return position.x < 1 || position.x > 21  || position.y < 1 || position.y > 21;
}

function getSnakeHead(){
    return snakeBody[0];
}

function snakeIntersection(){
    return onSnake(snakeBody[0], {ignoreHead: true});
}

//------------------------------------------------------------------------
// Mobile swipe
gameBoard.addEventListener("touchstart", handleTouchStart, false);
gameBoard.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;                                                        
let yDown = null;

function getTouches(evt) {
    return evt.touches
}  

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};

let previousSwipe = "";

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    let xUp = evt.touches[0].clientX;                                    
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            if(!previousSwipe === "horizontal"){
                inputDirection = {x:1, y:0};
                previousSwipe = "horizontal";
            }
        } else {
            if(!previousSwipe === "horizontal"){
                inputDirection = {x:-1, y:0};
                previousSwipe = "horizontal";
            }
        }                       
    } else {
        if ( yDiff > 0 ) {
            if(!previousSwipe === "vertical"){
                inputDirection = {x:0, y:1};
                previousSwipe = "vertical";
            }
        } else { 
            if(!previousSwipe === "vertical"){
                inputDirection = {x:0, y:-1};
                previousSwipe = "vertical";
            }
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};