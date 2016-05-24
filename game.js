// ---------------------------- global stuff ---------------------------------

var GRID_WIDTH = 30;
var GRID_HEIGHT = 30;
var GRID_SIZE = 10;
var CANVAS_WIDTH = GRID_SIZE * (GRID_WIDTH + 1);
var CANVAS_HEIGHT = GRID_SIZE * (GRID_HEIGHT + 1);
var MAX_GAME_SPEED = 25;

var food;
var snake;
var game;

// ---------------------------- helper functions -----------------------------

// generate a random number between min and max
function mnRandom(min, max){
  return Math.floor(min + Math.random() * (max - min));
}

// draw an elipse that is the size of the grid
function gridEllipse(x, y, color){
  fill(color);
  ellipse(
    x * GRID_SIZE + GRID_SIZE/2,
    y * GRID_SIZE + GRID_SIZE/2,
    GRID_SIZE, GRID_SIZE
  );
}

// ------------------------------ snake stuff --------------------------------

function drawSnake(snake){
  var segments = snake.segments;
  for(var i = 0; i < segments.length; i++){
    var segment = segments[i];
    gridEllipse(segment.x, segment.y, "#FF0000");
  }
}

function moveSnake(snake){
  var segments = snake.segments;
  var dx = snake.dx;
  var dy = snake.dy;

  // update each segment of the snake based on the segment in front
  // starting from the back of the snake
  for(var i = segments.length - 1; i > 0; i--){
    var curr = segments[i];
    var next = segments[i-1];
    curr.x = next.x;
    curr.y = next.y;
  }
  // move the head of the snake forward based on the direction the snake is
  // moving
  var head = segments[0];
  head.x += dx;
  head.y += dy;
}

function isSnakeCollidingWithSelf(snake){
  var segments = snake.segments;
  var head = segments[0];
  for(var i = segments.length - 1; i > 0; i--){
    var segment = segments[i];
    if(segment.x === head.x && segment.y === head.y){
      return true;
    }
  }
  return false;
}

function checkSnakeCollision(snake, food){
  var head = snake.segments[0];
  var x = head.x;
  var y = head.y;
  // if snake out of bounds
  if(x < 0 || y < 0 || x > GRID_WIDTH || y > GRID_HEIGHT){
    onDie();
  } else if(isSnakeCollidingWithSelf(snake)){
    onDie();
  // collision with food
  } else if(x === food.x && y === food.y) {
    onEat();
  }
}

// ------------------------------ food stuff ---------------------------------

function drawFood(food){
  gridEllipse(food.x, food.y, "#00FF00");
}

function placeFoodRandomly(food){
  food.x = mnRandom(0, GRID_WIDTH);
  food.y = mnRandom(0, GRID_HEIGHT);
}

// ------------------ user interface and background stuff ---------------------

function drawBackground(){
  background("#DDDDDD");
}

function drawScore(score){
  $(".score .num").text(score);
}

function setOverlayText(text){
  $(".overlay").html(text);
}

// -------------------------------- game stuff --------------------------------

function resetGame(){
  game = {
    running: true,
    score: 0,
    speed: 5,
    time: 0
  };
  resetSnake();
  resetFood();
  setOverlayText("");
}

function resetSnake(){
  snake = {
    segments: [
      { x: 2, y: 0},
      { x: 1, y: 0},
      { x: 0, y: 0}
    ],
    dx: 1,
    dy: 0
  };
}

function resetFood(){
  food = {};
  placeFoodRandomly(food);
}

function onDie(){
  game.running = false;
  setOverlayText("you lose! score: " + game.score);
}

function onWin(){
  game.running = false;
  setOverlayText("you win! score: " + game.score);
}

function onEat(){
  // add another snake segment
  // we don't set it to the actual x and y because the movement function does
  // it for us
  snake.segments.push({
    x: 0,
    y: 0
  });
  placeFoodRandomly(food);
  game.score += 1;
  if(game.speed < MAX_GAME_SPEED){
    game.speed += 1;
  }
}

// this is for setting up the game
function setup(){
  canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  // put the canvas in the game div
  canvas.parent("game");
  resetGame();
  // when the reset button is clicked reset the game
  $("button.reset").click(resetGame);
}

// this gets called every game tick
function draw(){
  // how many ticks has the game gone so far
  game.time += 1;
  // should we actually run the game logic?
  // game.time % game speed adjusts game speed by not running the logic step
  // every tick and instead running it every MAX_GAME_SPEED + 1 - game.speed
  // ticks
  if(game.running && game.time % (MAX_GAME_SPEED + 1 - game.speed) === 0){
    checkSnakeCollision(snake, food);
    moveSnake(snake);
  }

  // draw all the things!
  drawBackground();
  drawFood(food);
  drawSnake(snake);
  drawScore(game.score);
}

// this gets called when a user presses a button
function keyPressed() {
  // check what direction the snake should be moving AND
  // check that the snake is not turning back on itself
  if (keyCode === LEFT_ARROW && !(snake.dx === 1 && snake.dy === 0)) {
    snake.dx = -1;
    snake.dy = 0;
  } else if (keyCode === RIGHT_ARROW && !(snake.dx === -1 && snake.dy === 0)) {
    snake.dx = 1;
    snake.dy = 0;
  } else if (keyCode === DOWN_ARROW && !(snake.dx === 0 && snake.dy === -1)) {
    snake.dx = 0;
    snake.dy = 1;
  } else if (keyCode === UP_ARROW && !(snake.dx === 0 && snake.dy === 1)) {
    snake.dx = 0;
    snake.dy = -1;
  }
}
