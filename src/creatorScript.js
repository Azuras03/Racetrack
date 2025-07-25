import * as constants from './constants.js';
import Player from './player.js';

let WIDTH_TILE = 30
let HEIGHT_TILE = 30
let mousedown = false;

let gridElements = [];

createGame()

function createGame() {
    // Initialisation de la grille
    for (let i = 0; i < constants.NUM_TILES_X * constants.trackDensity; i++) {
        gridElements[i] = [];
        for (let j = 0; j < constants.NUM_TILES_Y * constants.trackDensity; j++) {
            gridElements[i][j] = 0; // 0 = pas de route, 1 = route
        }
    }

    constants.touchCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
    constants.touchCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;
    constants.pathCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
    constants.pathCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;
    constants.gameCanvas.width = (constants.NUM_TILES_X - 1) * WIDTH_TILE;
    constants.gameCanvas.height = (constants.NUM_TILES_Y - 1) * HEIGHT_TILE;

    renderCurrentGame();
}

constants.touchCanvas.addEventListener('mousedown', (event) => {
    mousedown = true;
});

constants.touchCanvas.addEventListener('mouseup', (event) => {
    mousedown = false;
});

// Event quand on reste appuyé sur le canvas, pour dessiner des routes
constants.touchCanvas.addEventListener('mousemove', (event) => {
    if (!mousedown) return;
    const rect = constants.touchCanvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left + WIDTH_TILE / 2) / WIDTH_TILE * constants.trackDensity);
    const y = Math.floor((event.clientY - rect.top + HEIGHT_TILE / 2) / HEIGHT_TILE * constants.trackDensity);

    gridElements[x][y] = 1;
    if (gridElements[x][y] === 1) {
        console.log(`Clicked on a road tile at (${x}, ${y})`);
    } else {
        console.log(`Clicked on a non-road tile at (${x}, ${y})`);
    }

    renderCurrentGame();

    console.log(`Clicked on position: (${x}, ${y})`);
});

constants.exportButton.addEventListener('click', () => {
    // Données du terrain qu'on mimifie
    let data = "";
    data = formatTerrainData(data);
    // Créer un blob avec les données
    const blob = new Blob([data], { type: 'text/plain' });
    // Créer un lien pour télécharger le fichier
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'racetrack.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Exported racetrack data to racetrack.txt");
});

function formatTerrainData(data) {
    for (let i = 0; i < constants.NUM_TILES_X * constants.trackDensity; i++) {
        for (let j = 0; j < constants.NUM_TILES_Y * constants.trackDensity; j++) {
            data += gridElements[i][j];
            if (j < constants.NUM_TILES_Y * constants.trackDensity - 1) {
                data += " "; // Séparer les valeurs par des espaces
            }
        }
        data += "\n";
    }
    return data;
}

function renderCurrentGame() {
    constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    renderTerrain();
    renderCanvas();
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