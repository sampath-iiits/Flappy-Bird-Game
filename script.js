let canvas;
let canvasWidth = 800;
let canvasHeight = 640;
let context;

let birdWidth = 50;
let birdHeight = 30;
let birdX = canvasWidth / 8;
let birdY = canvasHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 500;
let pipeX = canvasWidth;
let pipeY = 0;

let UpperPipeImg;
let LowerPipeImg;

let velocityX = -4;
let velocityY = -8;
let gravity = 0.3;

let gameOver = false;
let gameStarted = false;
let score = 0;

window.onload = function () {
    canvas = document.getElementById("canvas");
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    context = canvas.getContext("2d");

    

    birdImg = new Image();
    birdImg.src = "Bird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    UpperPipeImg = new Image();
    UpperPipeImg.src = "UpperPipe.png";

    LowerPipeImg = new Image();
    LowerPipeImg.src = "LowerPipe.png";

    drawInitialScreen();

    document.addEventListener("keydown", startGame);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleRetryClick);

    // Add touch event for mobile devices
    canvas.addEventListener("touchstart", handleTouchStart);
};

function handleMouseMove(e) {
    if (!gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Scale factor for X
    const scaleY = canvas.height / rect.height; // Scale factor for Y
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const retryButtonX = canvasWidth / 3;
    const retryButtonY = canvasHeight / 3 + 150;
    const retryButtonWidth = canvasWidth / 4;
    const retryButtonHeight = 40;

    if (
        mouseX >= retryButtonX &&
        mouseX <= retryButtonX + retryButtonWidth &&
        mouseY >= retryButtonY &&
        mouseY <= retryButtonY + retryButtonHeight
    ) {
        canvas.style.cursor = "pointer";
    } else {
        canvas.style.cursor = "default";
    }
}

function handleRetryClick(e) {
    if (!gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Scale factor for X
    const scaleY = canvas.height / rect.height; // Scale factor for Y
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const retryButtonX = canvasWidth / 3;
    const retryButtonY = canvasHeight / 3 + 150;
    const retryButtonWidth = canvasWidth / 4;
    const retryButtonHeight = 40;

    if (
        clickX >= retryButtonX &&
        clickX <= retryButtonX + retryButtonWidth &&
        clickY >= retryButtonY &&
        clickY <= retryButtonY + retryButtonHeight
    ) {
        resetGame();
    }
}

function handleTouchStart(e) {
    if (!gameStarted) {
        startGame({ code: "Space" }); // Simulate Space key for starting the game
    } else if (gameOver) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const touchX = (e.touches[0].clientX - rect.left) * scaleX;
        const touchY = (e.touches[0].clientY - rect.top) * scaleY;

        const retryButtonX = canvasWidth / 3;
        const retryButtonY = canvasHeight / 3 + 150;
        const retryButtonWidth = canvasWidth / 4;
        const retryButtonHeight = 40;

        if (
            touchX >= retryButtonX &&
            touchX <= retryButtonX + retryButtonWidth &&
            touchY >= retryButtonY &&
            touchY <= retryButtonY + retryButtonHeight
        ) {
            resetGame();
        }
    } else {
        moveBird({ code: "Space" }); // Simulate Space key for bird jump
    }
}

function drawInitialScreen() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.font = "30px sans-serif";
    context.fillText("Press Space to start the game", canvasWidth / 4, canvasHeight / 1.9);
}

function startGame(e) {
    if (gameStarted || (e.code !== "Space" && e.type !== "touchstart")) return;

    gameStarted = true;
    document.removeEventListener("keydown", startGame);
    document.addEventListener("keydown", moveBird);
    canvas.removeEventListener("touchstart", handleTouchStart); // Remove touchstart listener for starting
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
}

function update() {
    requestAnimationFrame(update);
    if (!gameStarted || gameOver) {
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > canvas.height) {
        gameOver = true;
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(`Score: ${Math.floor(score)}`, 5, 45);

    if (gameOver) {
        drawGameOverScreen();
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = canvas.height / 4;

    let UpperPipe = {
        img: UpperPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(UpperPipe);

    let LowerPipe = {
        img: LowerPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(LowerPipe);
}

function moveBird(e) {
    if (e.code === "Space" || e.code === "Enter") {
        velocityY = -6;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function drawGameOverScreen() {
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "white";
    context.fillRect(canvasWidth / 4, canvasHeight / 3, canvasWidth / 2, canvasHeight / 3);

    context.fillStyle = "black";
    context.font = "30px sans-serif";
    context.fillText("Game Over", canvasWidth / 3, canvasHeight / 3 + 50);
    context.fillText(`Score: ${Math.floor(score)}`, canvasWidth / 3, canvasHeight / 3 + 100);

    context.fillStyle = "blue";
    context.fillRect(canvasWidth / 3, canvasHeight / 3 + 150, canvasWidth / 4, 40);

    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText("Retry", canvasWidth / 3 + 30, canvasHeight / 3 + 180);
}

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0;
}
