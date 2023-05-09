let canvas = document.getElementById('game'),
     ctx = canvas.getContext('2d')
     ballRadius = 9,
     x = canvas.width / (Math.floor(Math.random() * Math.random() * 10) + 3),
     y = canvas.height - 40,
     dx = 2,
     dy = -2;

let paddleHeight = 12,
     paddleWidth = 72;

// Paddle's start position
let paddleX = (canvas.width - paddleWidth) / 2;

// Create our bricks
let rowCount = 5,
     columnCount = 9,
     brickWidth = 54,
     brickHeight = 18,
     brickPadding = 12,
     topOffset = 40,
     leftOffset = 33,
     score = 0;

// Create array of bricks
let bricks = [];
for (let c = 0; c < columnCount; c++) {
     bricks[c] = [];
     for (let r = 0; r < rowCount; r++) {
          // Set the position of the bricks
          bricks [c][r] = { x: 0, y: 0, status: 1};
     }
}

// Mouse Motion Capturing - eventListener
document.addEventListener("mousemove", mouseMoveHandler, false);

// Move the paddle with the mouse itself
function mouseMoveHandler(e) {
     var relativeX = e.clientX - canvas.offsetLeft;
     if (relativeX > 0 && relativeX < canvas.width) {
          paddleX = relativeX - paddleWidth / 2;
     }
}

// Draw the paddle
function drawPaddle() {
     ctx.beginPath();
     ctx.roundRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight, 30);
     ctx.fillStyle = '#333';
     ctx.fill();
     ctx.closePath();
}

// Draw our ball
function drawBall() {
     ctx.beginPath();
     ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
     ctx.fillStyle = '#333';
     ctx.closePath();
}

// Draw our bricks
function drawBricks() {
     for (let c = 0; c < columnCount; c++) {
          for (let r = 0; r < rowCount; r++) {
               if (bricks[c][r].status === 1) {
                    let brickX = (c * (brickWidth * brickPadding)) + leftOffset;
                    let brickY = (r * (brickHeight + brickPadding)) + topOffset;
                    
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 30);
                    ctx.fillStyle = '#333';
                    ctx.fill();
                    ctx.closePath();
               }
          }
     }
}

// Track the score
function trackScore() {
     ctx.font = 'bold 16px sans-srif';
     ctx.fillStyle='#333';
     ctx.fillText('Score : ' + score, 8, 24);
}

// See if the ball has hit the 
function hitDetection() {
     for (let c = 0; c < columnCount; c++) {
          for (let r = 0; r < rowCount; r++) {
               let b = bricks[c][r];
               if (b.status === 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                         dy = -dy;
                         b.status = 0;
                         score++;
                         // WIN CONDITION
                         if (score === rowCount * columnCount) {
                              alert('You Win!');
                              document.location.reload();
                         }
                    }
               }
          }
     }
}

// MAIN FUNCTION
function init() {
     ctx.clearRect(0,0, canvas.width, canvas.height);
     trackScore();
     drawBricks();
     drawBall();
     drawPaddle();
     hitDetection();

     // Walls
     if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
          dx = -dx;
     }

     if (y * dy < ballRadius) {
          dy = -dy;
     } else if (y + dy > canvas.height - ballRadius) {
          // Paddle Detections
          if (x > paddleX && x < paddleX + paddleWidth) {
               dy = -dy;
          } else {
               // Ball falls into abyss
               //alert ('Game Over');
               //document.location.reload()
          }
     }

     if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
          dy = -dy;
     }

     // Motion
     x += dx;
     y += dy;
}

setInterval(init, 10);

//https://youtu.be/VG28CuvY_ZA 