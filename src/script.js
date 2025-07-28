import * as constants from './constants.js';
import { utils } from './utils.js';
import Player from './player.js';

let gridElements = [];
let spawners = [];
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

const aspect = utils.num_tiles_x / utils.num_tiles_y; // Par exemple 16/9 ou 4/3

readAssetFileAndCreateTerrain('assets/trackTemplate.txt').then(() => {
    updateResolution();
})

function initializePlayers() {
    players = [];
    for (let i = 0; i < numberPlayers; i++) {
        const x = spawners[i % spawners.length].x;
        const y = spawners[i % spawners.length].y;
        players.push(new Player(x, y,
            `hsl(${Math.random() * 360}, 100%, 50%)`));
    }
    getAllPlayersMoves()
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

    WIDTH_TILE = WIDTH_CANVAS / (utils.num_tiles_x - 1);
    HEIGHT_TILE = HEIGHT_CANVAS / (utils.num_tiles_y - 1);

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
    getAllPlayersMoves();
    renderCurrentGame();
}

function getAllPlayersMoves() {
    for (let player of players) {
        player.getMoves(gridElements);
    }
}

function fillGrid() {
    for (let i = 0; i < utils.num_tiles_x * utils.trackDensity; i++) {
        gridElements[i] = [];
        for (let j = 0; j < utils.num_tiles_y * utils.trackDensity; j++) {
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
        loadTerrain(content);
        renderCurrentGame();
    };
    reader.readAsText(file);
    console.log("File read successfully.");
}

async function readAssetFileAndCreateTerrain(filePath) {
    await fetch(filePath)
        .then(response => {
            return response.text();
        })
        .then(content => {
            loadTerrain(content);
            initializePlayers()
            renderCurrentGame();
        })
}

function loadTerrain(content) {
    const sections = content.split('<<');
    if (sections.length < 2) {
        console.error("Invalid file format. No terrain data found.");
        return;
    }
    const firstLine = sections[0].trim().split(' ');
    if (firstLine.length < 3) {
        console.error("Invalid file format. Expected at least 3 values in the first line.");
        return;
    }
    utils.num_tiles_x = parseInt(firstLine[0]);
    utils.num_tiles_y = parseInt(firstLine[1]);
    utils.trackDensity = parseInt(firstLine[2]);

    fillGrid();

    const lines = sections[1].trim().split('\n');
    for (let i = 0; i < utils.num_tiles_x * utils.trackDensity; i++) {
        const elements = lines[i].split(" ");
        for (let j = 0; j < utils.num_tiles_y * utils.trackDensity; j++) {
            gridElements[i][j] = parseInt(elements[j]);
        }
    }

    // Add the spawners
    const spawnersData = sections[2].trim().split(', ');
    for (let data of spawnersData) {
        const [x, y] = data.split(' ').map(Number);
        if (x >= 0 && x < utils.num_tiles_x && y >= 0 && y < utils.num_tiles_y) {
            spawners.push({ x, y });
        }
    }
    console.log("Terrain loaded successfully.");
}

function renderCurrentGame() {
    constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    renderTerrain(constants.ctxGame);
    renderSpawners(constants.ctxGame);
    renderCanvas(constants.ctxGame);

    constants.ctxPath.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    for (let player of players) {
        renderPath(player, constants.ctxPath);
        renderPlayer(player, constants.ctxPath);
    }
    renderPlayerMoves(players[turn], constants.ctxPath);
}

function renderTerrain(ctx) {
    ctx.fillStyle = '#000000';
    for (let i = 0; i < utils.num_tiles_x * utils.trackDensity; i++) {
        for (let j = 0; j < utils.num_tiles_y * utils.trackDensity; j++) {
            if (gridElements[i][j] === 0) {
                continue;
            }
            if (gridElements[i][j] === 1) {
                ctx.fillStyle = '#000000'; // Couleur pour le terrain
            }
            if (gridElements[i][j] === 2) {
                ctx.fillStyle = '#FF0000'; // Couleur pour le terrain d'arrivée
            }
            ctx.fillRect(i * WIDTH_TILE / utils.trackDensity - WIDTH_TILE / (2 * utils.trackDensity),
                j * HEIGHT_TILE / utils.trackDensity - HEIGHT_TILE / (2 * utils.trackDensity),
                WIDTH_TILE / utils.trackDensity,
                HEIGHT_TILE / utils.trackDensity);
        }
    }
}

function renderCanvas(ctx) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = strokeWidth;
    for (let i = 0; i <= utils.num_tiles_x; i++) {
        ctx.beginPath();
        ctx.moveTo(i * WIDTH_TILE, 0);
        ctx.lineTo(i * WIDTH_TILE, constants.touchCanvas.height);
        ctx.stroke();
    }
    for (let j = 0; j <= utils.num_tiles_y; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * HEIGHT_TILE);
        ctx.lineTo(constants.touchCanvas.width, j * HEIGHT_TILE);
        ctx.stroke();
    }
}

function renderPath(player, ctx) {
    ctx.strokeStyle = player.color;
    ctx.lineWidth = playerStrokeWidth;

    ctx.beginPath();
    ctx.moveTo(player.moves[0].x * WIDTH_TILE,
        player.moves[0].y * HEIGHT_TILE);
    for (let move of player.moves) {
        // Draw a line from the move position to the current player position
        ctx.lineTo(move.x * WIDTH_TILE,
            move.y * HEIGHT_TILE);
        ctx.stroke();
    }
}

function renderSpawners(ctx) {
    ctx.fillStyle = '#FF0000'; // Couleur pour le spawner
    for (const spawner of spawners) {
        ctx.beginPath();
        ctx.arc(spawner.x * WIDTH_TILE, spawner.y * HEIGHT_TILE,
            Math.min(WIDTH_TILE, HEIGHT_TILE) / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    ctx.fillStyle = '#000000'; // Revenir à la couleur de base
}

function renderPlayerMoves(player, ctx) {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    player.possibleMoves.forEach(move => {
        ctx.beginPath();
        ctx.arc(move.x * WIDTH_TILE, move.y * HEIGHT_TILE, playerRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function renderPlayer(player, ctx) {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.position.x * WIDTH_TILE, player.position.y * HEIGHT_TILE, playerRadius, 0, Math.PI * 2);
    ctx.fill();
}
