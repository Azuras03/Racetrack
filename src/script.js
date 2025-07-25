import * as constants from './constants.js';
import Player from './player.js';

let NUM_TILES_X = 30
let NUM_TILES_Y = 20

let WIDTH_TILE = 30
let HEIGHT_TILE = 30

let gridGame = [];
let numberPlayers = 2;
let player = new Player(0,0, "red");

createGame()

function createGame(){
    constants.touchCanvas.width = NUM_TILES_X * WIDTH_TILE;
    constants.touchCanvas.height = NUM_TILES_Y * HEIGHT_TILE;
    constants.pathCanvas.width = NUM_TILES_X * WIDTH_TILE;
    constants.pathCanvas.height = NUM_TILES_Y * HEIGHT_TILE;
    constants.gameCanvas.width = NUM_TILES_X * WIDTH_TILE;
    constants.gameCanvas.height = NUM_TILES_Y * HEIGHT_TILE;

    // constants.game.style.width = `${NUM_TILES_X * WIDTH_TILE}px`;
    // constants.game.style.height = `${NUM_TILES_Y * HEIGHT_TILE}px`;
    // constants.game.style.display = 'grid';
    // constants.game.style.gridTemplateColumns = `repeat(${NUM_TILES_X}, ${WIDTH_TILE}px)`;
    // constants.game.style.gridTemplateRows = `repeat(${NUM_TILES_Y}, ${HEIGHT_TILE}px)`;

    // Créer un cadrillage sur le canvas
    renderCanvas();

    // Render the player
    renderPlayer(constants.ctxTouch);
    player.getMoves();
    renderPlayerMoves();
}

constants.touchCanvas.addEventListener('click', (event) => {
    // Déterminer quelle intersection entre deux lignes a été cliquée. Genre le cadrillage, là où deux lignes se croisent.
    const rect = constants.touchCanvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / WIDTH_TILE);
    const y = Math.floor((event.clientY - rect.top) / HEIGHT_TILE);
    
    player.move(x, y);
    renderCanvas();
    player.getMoves();

    constants.ctxPath.clearRect(0, 0, constants.pathCanvas.width, constants.pathCanvas.height);
    renderPath();
    renderPlayerMoves();
    renderPlayer();
    
    console.log(`Clicked on position: (${x}, ${y})`);
});

function renderCanvas() {
    constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    constants.ctxGame.strokeStyle = '#000000';
    constants.ctxGame.lineWidth = 1;
    for (let i = 0; i <= NUM_TILES_X; i++) {
        constants.ctxGame.beginPath();
        constants.ctxGame.moveTo(i * WIDTH_TILE + WIDTH_TILE / 2, 0);
        constants.ctxGame.lineTo(i * WIDTH_TILE + WIDTH_TILE / 2, constants.touchCanvas.height);
        constants.ctxGame.stroke();
    }
    for (let j = 0; j <= NUM_TILES_Y; j++) {
        constants.ctxGame.beginPath();
        constants.ctxGame.moveTo(0, j * HEIGHT_TILE + HEIGHT_TILE / 2);
        constants.ctxGame.lineTo(constants.touchCanvas.width, j * HEIGHT_TILE + HEIGHT_TILE / 2);
        constants.ctxGame.stroke();
    }
}

function renderPath() {
    constants.ctxPath.strokeStyle = player.color;
    constants.ctxPath.lineWidth = 3;

    constants.ctxPath.beginPath();
        constants.ctxPath.moveTo(player.moves[0].x * WIDTH_TILE + WIDTH_TILE / 2,
            player.moves[0].y * HEIGHT_TILE + HEIGHT_TILE / 2);
    for (let move of player.moves) {
        // Draw a line from the move position to the current player position
        constants.ctxPath.lineTo(move.x * WIDTH_TILE + WIDTH_TILE / 2,
            move.y * HEIGHT_TILE + HEIGHT_TILE / 2);
        constants.ctxPath.stroke();
    }
}

function renderPlayerMoves() {
    constants.ctxPath.fillStyle = 'rgba(0, 255, 0, 0.5)';
    player.possibleMoves.forEach(move => {
        constants.ctxPath.beginPath();
        constants.ctxPath.arc(move.x * WIDTH_TILE + WIDTH_TILE / 2, move.y * HEIGHT_TILE + HEIGHT_TILE / 2, 10, 0, Math.PI * 2);
        constants.ctxPath.fill();
    });
}

function renderPlayer() {
    constants.ctxPath.fillStyle = player.color;
    constants.ctxPath.beginPath();
    constants.ctxPath.arc(player.position.x * WIDTH_TILE + WIDTH_TILE / 2, player.position.y * HEIGHT_TILE + HEIGHT_TILE / 2, 10, 0, Math.PI * 2);
    constants.ctxPath.fill();
}
