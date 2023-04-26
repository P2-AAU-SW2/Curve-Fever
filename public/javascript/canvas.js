// const playerColors = ["#32BEFF", "#FF6DDE", "#FFF116", "#B9FF32", "#FF6D6D"];
// const playerNames = [
//     "Player 1",
//     "Player 2",
//     "Player 3",
//     "Player 4",
//     "Player 5",
// ];
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Define a simple curve object with a position, direction, color, and speed
class Curve {
    constructor(x, y, direction, color, speed, lineWidth) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.color = color;
        this.speed = speed;
        this.path = [];
        this.turnSpeed = 0.065;
        this.turnDirection = 0;
        this.lineWidth = lineWidth;
        this.collided = false;
        this.jumps = [];
        this.jumpFrames = 14;
        this.AccJumpFrames = 0;
        this.jumpChance = 0.0;
        this.jumpFrequency = 0.005;
    }

    init() {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = "round";
        this.draw();
    }

    draw() {
        if (this.path.length > 1) {
            // Draws the entire path for every animation frame so the line is smooth
            // let isJumping = this.isJumping();
            ctx.beginPath();
            ctx.moveTo(this.path[0].x, this.path[0].y);
            for (let i = 1, j = 0; i < this.path.length; i++) {
                if (i == this.jumps[j]) {
                    if (this.jumps.length > j + 1) {
                        i = this.jumps[j + 1];
                        if (this.jumps.length >= j + 2) j += 2;
                        ctx.moveTo(this.path[i].x, this.path[i].y);
                    } else {
                        i = this.path.length - 1;
                        const radius = 0.75;
                        ctx.stroke();
                        ctx.closePath();
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.closePath();
                    }
                } else {
                    ctx.lineTo(this.path[i].x, this.path[i].y);
                }
            }
            ctx.stroke();
            ctx.closePath();
            if (this.isJumping()) this.path.pop();
        }
    }

    update() {
        this.collision();
        this.jumping();
        // Update direction based on keyState
        if (keyState.ArrowLeft > keyState.ArrowRight) {
            this.direction -= this.turnSpeed;
        } else if (keyState.ArrowLeft < keyState.ArrowRight) {
            this.direction += this.turnSpeed;
        }

        // Update position based on direction and speed
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        // Add the current position to the path
        this.path.push({ x: this.x, y: this.y });

        this.draw();
    }

    collision() {
        // Check if curve hit the wall
        if (
            this.x < 0 ||
            this.x > canvas.width ||
            this.y < 0 ||
            this.y > canvas.height
        ) {
            this.collided = true;
        }

        if (!this.isJumping()) {
            // Check if curve hit its own path. Don't check recent points in path since it can collide with them
            // given the current point is close enough. This logic needs to be different for hitting other players
            for (let i = 0; i < this.path.length - 10; i++) {
                // L2 norm: get shortest distance
                const distance = Math.sqrt(
                    (this.path[i].x - this.x) ** 2 +
                        (this.path[i].y - this.y) ** 2
                );
                if (distance < this.lineWidth - 0.1) {
                    this.collided = true;
                    break;
                }
            }
        }
    }

    jumping() {
        if (this.isJumping()) {
            this.AccJumpFrames++;
        } else {
            let chance = Math.floor(Math.random() * 11) * this.jumpChance;
            if (chance >= 5) {
                this.toggleJump();
                this.jumpChance = 0.0;
            } else {
                this.jumpChance += this.jumpFrequency;
            }
        }
        if (this.jumpFrames <= this.AccJumpFrames) {
            this.toggleJump();
            this.AccJumpFrames = 0;
        }
    }

    isJumping() {
        return this.jumps.length % 2;
    }

    toggleJump() {
        this.jumps.push(this.path.length);
    }
}

// Create a curve instance
const curve = new Curve(
    canvas.width / 2,
    canvas.height / 2,
    0,
    "#32BEFF",
    1.5,
    7
);

// Object to store the state of the arrow keys
const keyState = {
    ArrowLeft: 0,
    ArrowRight: 0,
};

// Update keyState based on keydown and keyup events
document.addEventListener("keydown", (event) => {
    let key = event.key;
    if (!keyState[key]) {
        if (key == "ArrowLeft") {
            keyState[key] = keyState.ArrowRight + 1;
        } else if (key == "ArrowRight") {
            keyState[key] = keyState.ArrowLeft + 1;
        }
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key in keyState) {
        keyState[event.key] = 0;
    }
});

curve.init();
// Main game loop
function gameLoop() {
    // we need to clear the canvas for every frame so the line fx. is smooth
    if (!curve.collided) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        curve.update();

        requestAnimationFrame(gameLoop);
    }
}

// Start the game loop
gameLoop();
