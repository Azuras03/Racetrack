import * as constants from './constants.js';
import Player from './player.js';

let NUM_TILES_X = 20
let NUM_TILES_Y = 10

let WIDTH_TILE = 50
let HEIGHT_TILE = 50

let gridGame = [];
let numberPlayers = 2;
let player = new Player("Player 1", "red");

createGame()

function createGame(){
    constants.game.style.width = `${NUM_TILES_X * WIDTH_TILE}px`;
    constants.game.style.height = `${NUM_TILES_Y * HEIGHT_TILE}px`;
    // constants.game.style.display = 'grid';
    // constants.game.style.gridTemplateColumns = `repeat(${NUM_TILES_X}, ${WIDTH_TILE}px)`;
    // constants.game.style.gridTemplateRows = `repeat(${NUM_TILES_Y}, ${HEIGHT_TILE}px)`;

    // Créer un cadrillage sur le canvas
    renderCanvas();

    // Render the player
    renderPlayer(constants.ctx);
    player.getMoves();
    renderPlayerMoves();
}

canvas.addEventListener('click', (event) => {
    // Déterminer quelle intersection entre deux lignes a été cliquée. Genre le cadrillage, là où deux lignes se croisent.
    const rect = constants.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / WIDTH_TILE);
    const y = Math.floor((event.clientY - rect.top) / HEIGHT_TILE);
    player.move(x, y);
    renderCanvas();
    player.getMoves();
    renderPlayer();
    renderPlayerMoves();
    console.log(`Clicked on position: (${x}, ${y})`);
});

function renderCanvas() {
    constants.canvas.width = NUM_TILES_X * WIDTH_TILE;
    constants.canvas.height = NUM_TILES_Y * HEIGHT_TILE;
    constants.ctx.fillStyle = '#FFFFFF';
    constants.ctx.fillRect(0, 0, constants.canvas.width, constants.canvas.height);
    constants.ctx.strokeStyle = '#000000';
    constants.ctx.lineWidth = 1;
    for (let i = 0; i <= NUM_TILES_X; i++) {
        constants.ctx.beginPath();
        constants.ctx.moveTo(i * WIDTH_TILE + WIDTH_TILE / 2, 0);
        constants.ctx.lineTo(i * WIDTH_TILE + WIDTH_TILE / 2, constants.canvas.height);
        constants.ctx.stroke();
    }
    for (let j = 0; j <= NUM_TILES_Y; j++) {
        constants.ctx.beginPath();
        constants.ctx.moveTo(0, j * HEIGHT_TILE + HEIGHT_TILE / 2);
        constants.ctx.lineTo(constants.canvas.width, j * HEIGHT_TILE + HEIGHT_TILE / 2);
        constants.ctx.stroke();
    }
    return constants.ctx;
}

function renderPlayerMoves() {
    constants.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    player.moves.forEach(move => {
        constants.ctx.beginPath();
        constants.ctx.arc(move.x * WIDTH_TILE + WIDTH_TILE / 2, move.y * HEIGHT_TILE + HEIGHT_TILE / 2, 10, 0, Math.PI * 2);
        constants.ctx.fill();
    });
}

function renderPlayer() {
    constants.ctx.fillStyle = player.color;
    constants.ctx.beginPath();
    constants.ctx.arc(player.position.x * WIDTH_TILE + WIDTH_TILE / 2, player.position.y * HEIGHT_TILE + HEIGHT_TILE / 2, 10, 0, Math.PI * 2);
    constants.ctx.fill();
}
