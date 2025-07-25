import * as constants from './constants.js';
import Player from './player.js';

let WIDTH_TILE = 30
let HEIGHT_TILE = 30

let gridElements = [];
let numberPlayers = 4;
let players = [];
let turn = 0;
let moves = [];


createGame()

function createGame() {
    players = [];
    for (let i = 0; i < numberPlayers; i++) {
        const x = Math.floor(Math.random() * constants.NUM_TILES_X);
        const y = Math.floor(Math.random() * constants.NUM_TILES_Y);
        players.push(new Player(x, y,
             `hsl(${Math.random() * 360}, 100%, 50%)`));
    }
    // Initialisation de la grille
    fillGrid();

    constants.touchCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
    constants.touchCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;
    constants.pathCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
    constants.pathCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;
    constants.gameCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
    constants.gameCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;

    initiateTurn();
}

constants.touchCanvas.addEventListener('click', (event) => {
    // Déterminer quelle intersection entre deux lignes a été cliquée. Genre le cadrillage, là où deux lignes se croisent.
    const rect = constants.touchCanvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left + WIDTH_TILE / 2) / WIDTH_TILE);
    const y = Math.floor((event.clientY - rect.top + HEIGHT_TILE / 2) / HEIGHT_TILE);

    if (!players[turn].canMove(x, y)) {
        console.log(`Cannot move to (${x}, ${y})`);
        return;
    }
    players[turn].move(x, y);
    turn = (turn + 1) % numberPlayers; // Passer au joueur suivant
    initiateTurn();
    console.log(`Player ${turn + 1}'s turn`);

    console.log(`Clicked on position: (${x}, ${y})`);
});

constants.importButton.addEventListener('change', readSingleFileAndCreateTerrain);

function initiateTurn() {
    players[turn].getMoves(gridElements);
    renderCurrentGame();
}

function fillGrid() {
    for (let i = 0; i < constants.NUM_TILES_X * constants.trackDensity; i++) {
        gridElements[i] = [];
        for (let j = 0; j < constants.NUM_TILES_Y * constants.trackDensity; j++) {
            gridElements[i][j] = 0;
        }
    }
}

function readSingleFileAndCreateTerrain(event) {
    const file = event.target.files[0];
    if (!file) {
        console.error("No file selected.");
        return;
    }

    fillGrid()
    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        console.log(content)
        const lines = content.split('\n');
        for (let i = 0; i < constants.NUM_TILES_X * constants.trackDensity; i++) {
            const elements = lines[i].split(" ");
            for (let j = 0; j < constants.NUM_TILES_Y * constants.trackDensity; j++) {
                gridElements[i][j] = parseInt(elements[j]);
            }
        }
        renderCurrentGame();
    };
    reader.readAsText(file);
    console.log("File read successfully.");
}

function renderCurrentGame() {
    constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    renderTerrain();
    renderCanvas();

    constants.ctxPath.clearRect(0, 0, constants.pathCanvas.width, constants.pathCanvas.height);
    for (let player of players) {
        renderPath(player);
        renderPlayer(player);
    }
    renderPlayerMoves(players[turn]);
}

function renderTerrain() {
    constants.ctxGame.clearRect(0, 0, constants.gameCanvas.width, constants.gameCanvas.height);
    constants.ctxGame.fillStyle = '#000000';
    for (let i = 0; i < constants.NUM_TILES_X * constants.trackDensity; i++) {
        for (let j = 0; j < constants.NUM_TILES_Y * constants.trackDensity; j++) {
            if (gridElements[i][j] === 1) {
                constants.ctxGame.fillRect(i * WIDTH_TILE / constants.trackDensity - WIDTH_TILE / (2 * constants.trackDensity),
                    j * HEIGHT_TILE / constants.trackDensity - HEIGHT_TILE / (2 * constants.trackDensity),
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

function renderPath(player) {
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

function renderPlayerMoves(player) {
    constants.ctxPath.fillStyle = 'rgba(0, 255, 0, 0.5)';
    player.possibleMoves.forEach(move => {
        constants.ctxPath.beginPath();
        constants.ctxPath.arc(move.x * WIDTH_TILE, move.y * HEIGHT_TILE, 10, 0, Math.PI * 2);
        constants.ctxPath.fill();
    });
}

function renderPlayer(player) {
    constants.ctxPath.fillStyle = player.color;
    constants.ctxPath.beginPath();
    constants.ctxPath.arc(player.position.x * WIDTH_TILE, player.position.y * HEIGHT_TILE, 10, 0, Math.PI * 2);
    constants.ctxPath.fill();
}
