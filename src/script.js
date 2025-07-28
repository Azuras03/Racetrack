import * as constants from './constants.js';
import { utils } from './utils.js';
import Player from './player.js';
import * as canvas from './canvas.js';

let numberPlayers = 2;
let players = [];
let turn = 0;
let moves = [];

readAssetFileAndCreateTerrain('assets/trackTemplate.txt').then(() => {
    canvas.updateResolution();
    renderCurrentGame();
})

function initializePlayers() {
    players = [];
    for (let i = 0; i < numberPlayers; i++) {
        const x = utils.spawners[i % utils.spawners.length].x;
        const y = utils.spawners[i % utils.spawners.length].y;
        players.push(new Player(x, y,
            `hsl(${Math.random() * 360}, 100%, 50%)`));
    }
    getAllPlayersMoves()
}

// Add event listener for window resize
window.addEventListener('resize', () => {
    canvas.updateResolution();
    renderCurrentGame();
});


constants.touchCanvas.addEventListener('click', (event) => {
    // Déterminer quelle intersection entre deux lignes a été cliquée. Genre le cadrillage, là où deux lignes se croisent.
    const rect = constants.touchCanvas.getBoundingClientRect();
    let x = (event.clientX - rect.left + utils.widthTile / 2) / utils.widthTile;
    x = Math.floor(x * constants.touchCanvas.clientWidth / constants.touchCanvas.offsetWidth);
    let y = (event.clientY - rect.top + utils.heightTile / 2) / utils.heightTile;
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
        player.getMoves(utils.gridElements);
    }
}

function fillGrid() {
    for (let i = 0; i < utils.num_tiles_x * utils.trackDensity; i++) {
        utils.gridElements[i] = [];
        for (let j = 0; j < utils.num_tiles_y * utils.trackDensity; j++) {
            utils.gridElements[i][j] = 0;
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
        canvas.updateResolution();
        initializePlayers();
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
            utils.gridElements[i][j] = parseInt(elements[j]);
        }
    }

    // Add the spawners
    utils.spawners = [];
    const spawnersData = sections[2].trim().split(',');
    console.log(spawnersData);
    for (let data of spawnersData) {
        const [x, y] = data.split(' ').map(Number);
        if (x >= 0 && x < utils.num_tiles_x && y >= 0 && y < utils.num_tiles_y) {
            utils.spawners.push({ x, y });
        }
    }
    console.log("Terrain loaded successfully.");
}

function renderCurrentGame() {
    constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    canvas.renderTerrain(constants.ctxGame);
    canvas.renderSpawners(constants.ctxGame);
    canvas.renderCanvas(constants.ctxGame);

    constants.ctxPath.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    for (let player of players) {
        canvas.renderPath(player, constants.ctxPath);
        canvas.renderPlayer(player, constants.ctxPath);
    }
    canvas.renderPlayerMoves(players[turn], constants.ctxPath);
}