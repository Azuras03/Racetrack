import * as constants from './constants.js';
import Player from './player.js';

let WIDTH_TILE = 30
let HEIGHT_TILE = 30

let gridElements = [];
let numberPlayers = 2;
let player = new Player(0, 0, "red");

createGame()

function createGame() {
    for (let i = 0; i < constants.NUM_TILES_X * constants.trackDensity; i++) {
        gridElements[i] = [];
        for (let j = 0; j < constants.NUM_TILES_Y * constants.trackDensity; j++) {
            gridElements[i][j] = 0; // 0 = pas de route, 1 = route
        }
    }
    gridElements[0][0] = 1;
    gridElements[0][1] = 1;
    gridElements[0][2] = 1;
    gridElements[0][3] = 1;
    gridElements[0][4] = 1;
    gridElements[0][5] = 1;
    gridElements[1][0] = 1;
    gridElements[1][1] = 1;
    gridElements[1][2] = 1;
    gridElements[1][3] = 1;
    gridElements[1][4] = 1;
    gridElements[1][5] = 1;

    constants.touchCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
    constants.touchCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;
    constants.pathCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
    constants.pathCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;
    constants.gameCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
    constants.gameCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;

    // constants.game.style.width = `${constants.NUM_TILES_X * WIDTH_TILE}px`;
    // constants.game.style.height = `${constants.NUM_TILES_Y * HEIGHT_TILE}px`;
    // constants.game.style.display = 'grid';
    // constants.game.style.gridTemplateColumns = `repeat(${constants.NUM_TILES_X}, ${WIDTH_TILE}px)`;
    // constants.game.style.gridTemplateRows = `repeat(${constants.NUM_TILES_Y}, ${HEIGHT_TILE}px)`;

    renderCurrentGame();
}

constants.touchCanvas.addEventListener('click', (event) => {
    // Déterminer quelle intersection entre deux lignes a été cliquée. Genre le cadrillage, là où deux lignes se croisent.
    const rect = constants.touchCanvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left + WIDTH_TILE / 2) / WIDTH_TILE);
    const y = Math.floor((event.clientY - rect.top + HEIGHT_TILE / 2) / HEIGHT_TILE);

    player.move(x, y);
    renderCurrentGame();

    console.log(`Clicked on position: (${x}, ${y})`);
});

function renderCurrentGame() {
    constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    renderTerrain();
    renderCanvas();
    player.getMoves();

    constants.ctxPath.clearRect(0, 0, constants.pathCanvas.width, constants.pathCanvas.height);
    renderPath();
    renderPlayerMoves();
    renderPlayer();
}

function renderTerrain() {
    constants.ctxGame.clearRect(0, 0, constants.gameCanvas.width, constants.gameCanvas.height);
    constants.ctxGame.fillStyle = '#000000';
    for (let i = 0; i < constants.NUM_TILES_X * constants.trackDensity; i++) {
        for (let j = 0; j < constants.NUM_TILES_Y * constants.trackDensity; j++) {
            if (gridElements[i][j] === 1) {
                constants.ctxGame.fillRect(i * WIDTH_TILE / constants.trackDensity,
                    j * HEIGHT_TILE / constants.trackDensity,
                    WIDTH_TILE / constants.trackDensity,
                    HEIGHT_TILE / constants.trackDensity);
            }
        }
    }
}

function renderCanvas() {
    constants.ctxGame.strokeStyle = '#000000';
    constants.ctxGame.lineWidth = 1;
    for (let i = 0; i <= constants.NUM_TILES_X; i++) {
        constants.ctxGame.beginPath();
        constants.ctxGame.moveTo(i * WIDTH_TILE, 0);
        constants.ctxGame.lineTo(i * WIDTH_TILE, constants.touchCanvas.height);
        constants.ctxGame.stroke();
    }
    for (let j = 0; j <= constants.NUM_TILES_Y; j++) {
        constants.ctxGame.beginPath();
        constants.ctxGame.moveTo(0, j * HEIGHT_TILE);
        constants.ctxGame.lineTo(constants.touchCanvas.width, j * HEIGHT_TILE);
        constants.ctxGame.stroke();
    }
}

function renderPath() {
    constants.ctxPath.strokeStyle = player.color;
    constants.ctxPath.lineWidth = 3;

    constants.ctxPath.beginPath();
    constants.ctxPath.moveTo(player.moves[0].x * WIDTH_TILE,
        player.moves[0].y * HEIGHT_TILE);
    for (let move of player.moves) {
        // Draw a line from the move position to the current player position
        constants.ctxPath.lineTo(move.x * WIDTH_TILE,
            move.y * HEIGHT_TILE);
        constants.ctxPath.stroke();
    }
}

function renderPlayerMoves() {
    constants.ctxPath.fillStyle = 'rgba(0, 255, 0, 0.5)';
    player.possibleMoves.forEach(move => {
        constants.ctxPath.beginPath();
        constants.ctxPath.arc(move.x * WIDTH_TILE, move.y * HEIGHT_TILE, 10, 0, Math.PI * 2);
        constants.ctxPath.fill();
    });
}

function renderPlayer() {
    constants.ctxPath.fillStyle = player.color;
    constants.ctxPath.beginPath();
    constants.ctxPath.arc(player.position.x * WIDTH_TILE, player.position.y * HEIGHT_TILE, 10, 0, Math.PI * 2);
    constants.ctxPath.fill();
}
