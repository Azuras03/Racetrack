import * as constants from './constants.js';
import Player from './player.js';

let gridElements = [];
let numberPlayers = 2;
let players = [];
let turn = 0;
let moves = [];
let WIDTH_TILE = 0
let HEIGHT_TILE = 0

let playerStrokeWidth = 0; // Largeur du trait pour le rendu des chemins
let playerRadius = 0; // Rayon du cercle pour le rendu des joueurs
let strokeWidth = 0; // Largeur du trait pour le rendu des chemins

let WIDTH_CANVAS = 0;
let HEIGHT_CANVAS = 0;

const aspect = constants.NUM_TILES_X / constants.NUM_TILES_Y; // Par exemple 16/9 ou 4/3

createGame()
updateResolution()

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
}

// Add event listener for window resize
window.addEventListener('resize', updateResolution);

function updateResolution() {

    // Faire un rendu en fonction de l'aspect ratio, pour que le canvas soit le plus grand tout en prenant la place possible sans stretch
    const curentAspect = document.documentElement.clientWidth / document.documentElement.clientHeight;

    if (curentAspect > aspect) {
        constants.touchCanvas.width = document.documentElement.clientHeight * aspect;
        constants.touchCanvas.height = document.documentElement.clientHeight;
        constants.gameCanvas.width = document.documentElement.clientHeight * aspect;
        constants.gameCanvas.height = document.documentElement.clientHeight;
        constants.pathCanvas.width = document.documentElement.clientHeight * aspect;
        constants.pathCanvas.height = document.documentElement.clientHeight;
    } else {
        constants.touchCanvas.width = document.documentElement.clientWidth;
        constants.touchCanvas.height = document.documentElement.clientWidth / aspect;
        constants.gameCanvas.width = document.documentElement.clientWidth;
        constants.gameCanvas.height = document.documentElement.clientWidth / aspect;
        constants.pathCanvas.width = document.documentElement.clientWidth;
        constants.pathCanvas.height = document.documentElement.clientWidth / aspect;
    }
    WIDTH_CANVAS = constants.touchCanvas.width;
    HEIGHT_CANVAS = constants.touchCanvas.height;

    WIDTH_TILE = WIDTH_CANVAS / (constants.NUM_TILES_X-1);
    HEIGHT_TILE = HEIGHT_CANVAS / (constants.NUM_TILES_Y-1);

    strokeWidth = WIDTH_TILE / 15; // Largeur du trait pour le rendu des chemins
    playerStrokeWidth = WIDTH_TILE / 8; // Largeur du trait pour le rendu
    playerRadius = WIDTH_TILE / 3; // Rayon du cercle pour le rendu des joueurs
    renderCurrentGame()
}

constants.touchCanvas.addEventListener('click', (event) => {
    // Déterminer quelle intersection entre deux lignes a été cliquée. Genre le cadrillage, là où deux lignes se croisent.
    const rect = constants.touchCanvas.getBoundingClientRect();
    let x = (event.clientX - rect.left + WIDTH_TILE / 2) / WIDTH_TILE;
    x = Math.floor(x * constants.touchCanvas.clientWidth / constants.touchCanvas.offsetWidth);
    let y = (event.clientY - rect.top + HEIGHT_TILE / 2) / HEIGHT_TILE;
    y = Math.floor(y * constants.touchCanvas.clientHeight / constants.touchCanvas.offsetHeight);

    if (!players[turn].canMove(x, y)) {
        console.log(`Cannot move to (${x}, ${y})`);
        return;
    }
    players[turn].move(x, y);
    turn = (turn + 1) % numberPlayers; // Passer au joueur suivant

    while (players[turn].stun > 0) {
        players[turn].stun--;
        turn = (turn + 1) % numberPlayers; // Passer au joueur suivant
    }
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

    constants.ctxPath.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    for (let player of players) {
        renderPath(player);
        renderPlayer(player);
    }
    renderPlayerMoves(players[turn]);
}

function renderTerrain() {
    // constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
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
    constants.ctxGame.lineWidth = strokeWidth;
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
    constants.ctxPath.lineWidth = playerStrokeWidth;

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
        constants.ctxPath.arc(move.x * WIDTH_TILE, move.y * HEIGHT_TILE, playerRadius, 0, Math.PI * 2);
        constants.ctxPath.fill();
    });
}

function renderPlayer(player) {
    constants.ctxPath.fillStyle = player.color;
    constants.ctxPath.beginPath();
    constants.ctxPath.arc(player.position.x * WIDTH_TILE, player.position.y * HEIGHT_TILE, playerRadius, 0, Math.PI * 2);
    constants.ctxPath.fill();
}
