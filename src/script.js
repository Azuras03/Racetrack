import * as constants from './constants.js';
import Player from './player.js';

let WIDTH_TILE = 30
let HEIGHT_TILE = 30

let gridElements = [];
let numberPlayers = 2;
let players = [];
let turn = 0;
let moves = [];

constants.touchCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
constants.touchCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;
constants.gameCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
constants.gameCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;
constants.pathCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
constants.pathCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;

const aspect = constants.touchCanvas.width / constants.touchCanvas.height; // Par exemple 16/9 ou 4/3
updateSize();

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

    initiateTurn();
}

// Add event listener for window resize
window.addEventListener('resize', updateSize);

function updateSize() {
    const w = main.clientWidth;
    const h = main.clientHeight;
    if (w / h > aspect) {
        // Trop large, on limite par la hauteur
        constants.touchCanvas.style.height = h + 'px';
        constants.touchCanvas.style.width = (h * aspect) + 'px';
    } else {
        // Trop haut, on limite par la largeur
        constants.touchCanvas.style.width = w + 'px';
        constants.touchCanvas.style.height = (w / aspect) + 'px';
    }
}

constants.touchCanvas.addEventListener('click', (event) => {
    // Déterminer quelle intersection entre deux lignes a été cliquée. Genre le cadrillage, là où deux lignes se croisent.
    const rect = constants.touchCanvas.getBoundingClientRect();
    let x = (event.clientX - rect.left + WIDTH_TILE / 2) / WIDTH_TILE;
    x = Math.floor(x * constants.touchCanvas.width / constants.touchCanvas.offsetWidth);
    let y = (event.clientY - rect.top + HEIGHT_TILE / 2) / HEIGHT_TILE;
    y = Math.floor(y * constants.touchCanvas.height / constants.touchCanvas.offsetHeight);

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
    constants.ctxTouch.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    renderTerrain();
    touchCanvas();

    // constants.ctxTouch.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    for (let player of players) {
        renderPath(player);
        renderPlayer(player);
    }
    renderPlayerMoves(players[turn]);
}

function renderTerrain() {
    // constants.ctxTouch.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    constants.ctxTouch.fillStyle = '#000000';
    for (let i = 0; i < constants.NUM_TILES_X * constants.trackDensity; i++) {
        for (let j = 0; j < constants.NUM_TILES_Y * constants.trackDensity; j++) {
            if (gridElements[i][j] === 1) {
                constants.ctxTouch.fillRect(i * WIDTH_TILE / constants.trackDensity - WIDTH_TILE / (2 * constants.trackDensity),
                    j * HEIGHT_TILE / constants.trackDensity - HEIGHT_TILE / (2 * constants.trackDensity),
                    WIDTH_TILE / constants.trackDensity,
                    HEIGHT_TILE / constants.trackDensity);
            }
        }
    }
}

function touchCanvas() {
    constants.ctxTouch.strokeStyle = '#000000';
    constants.ctxTouch.lineWidth = 1;
    for (let i = 0; i <= constants.NUM_TILES_X; i++) {
        constants.ctxTouch.beginPath();
        constants.ctxTouch.moveTo(i * WIDTH_TILE, 0);
        constants.ctxTouch.lineTo(i * WIDTH_TILE, constants.touchCanvas.height);
        constants.ctxTouch.stroke();
    }
    for (let j = 0; j <= constants.NUM_TILES_Y; j++) {
        constants.ctxTouch.beginPath();
        constants.ctxTouch.moveTo(0, j * HEIGHT_TILE);
        constants.ctxTouch.lineTo(constants.touchCanvas.width, j * HEIGHT_TILE);
        constants.ctxTouch.stroke();
    }
}

function renderPath(player) {
    constants.ctxTouch.strokeStyle = player.color;
    constants.ctxTouch.lineWidth = 3;

    constants.ctxTouch.beginPath();
    constants.ctxTouch.moveTo(player.moves[0].x * WIDTH_TILE,
        player.moves[0].y * HEIGHT_TILE);
    for (let move of player.moves) {
        // Draw a line from the move position to the current player position
        constants.ctxTouch.lineTo(move.x * WIDTH_TILE,
            move.y * HEIGHT_TILE);
        constants.ctxTouch.stroke();
    }
}

function renderPlayerMoves(player) {
    constants.ctxTouch.fillStyle = 'rgba(0, 255, 0, 0.5)';
    player.possibleMoves.forEach(move => {
        constants.ctxTouch.beginPath();
        constants.ctxTouch.arc(move.x * WIDTH_TILE, move.y * HEIGHT_TILE, 10, 0, Math.PI * 2);
        constants.ctxTouch.fill();
    });
}

function renderPlayer(player) {
    constants.ctxTouch.fillStyle = player.color;
    constants.ctxTouch.beginPath();
    constants.ctxTouch.arc(player.position.x * WIDTH_TILE, player.position.y * HEIGHT_TILE, 10, 0, Math.PI * 2);
    constants.ctxTouch.fill();
}
