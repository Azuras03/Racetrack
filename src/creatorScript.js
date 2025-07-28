import * as constants from './constants.js';
import { utils } from './utils.js';
import Player from './player.js';

let mousedown = false;

let gridElements = [];
let spawners = [];
let WIDTH_TILE = 0
let HEIGHT_TILE = 0
let writeType = 1; // 1 = pencil, 0 = eraser, 2 = spawner

let strokeWidth = 0; // Largeur du trait pour le rendu des chemins

let WIDTH_CANVAS = 0;
let HEIGHT_CANVAS = 0;

const aspect = utils.num_tiles_x / utils.num_tiles_y; // Par exemple 16/9 ou 4/3

createGame()
updateResolution();

function createGame() {
    // Initialisation de la grille
    fillGrid();
}

constants.pencil.addEventListener('click', () => {
    constants.pencil.classList.add('active');
    constants.eraser.classList.remove('active');
    constants.clearButton.classList.remove('active');
    constants.spawner.classList.remove('active');
    writeType = 1; // Pencil
    console.log("Pencil selected");
});

constants.eraser.addEventListener('click', () => {
    constants.pencil.classList.remove('active');
    constants.eraser.classList.add('active');
    constants.clearButton.classList.remove('active');
    constants.spawner.classList.remove('active');
    writeType = 0; // Eraser
    console.log("Eraser selected");
});

constants.spawner.addEventListener('click', () => {
    constants.pencil.classList.remove('active');
    constants.eraser.classList.remove('active');
    constants.clearButton.classList.remove('active');
    constants.spawner.classList.add('active');
    writeType = 2; // Spawner
    console.log("Spawner selected");
});

constants.clearButton.addEventListener('click', () => {
    fillGrid();
    spawners = [];
    renderCurrentGame();
    console.log("Grid cleared");
});

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
    let x = Math.floor((event.clientX - rect.left + WIDTH_TILE / 2) / WIDTH_TILE);
    let y = Math.floor((event.clientY - rect.top + HEIGHT_TILE / 2) / HEIGHT_TILE);
    let xDensity = Math.floor((event.clientX - rect.left + WIDTH_TILE / 2) / WIDTH_TILE * constants.trackDensity);
    let yDensity = Math.floor((event.clientY - rect.top + HEIGHT_TILE / 2) / HEIGHT_TILE * constants.trackDensity);

    console.log(`Mouse moved to position: (${x}, ${y})`);
    console.log(`Mouse moved to density position: (${xDensity}, ${yDensity})`);
    if (writeType === 2) {
        // Si on est en mode spawner, on ajoute un spawner
        if (!spawners.some(spawner => spawner.x === x && spawner.y === y)) {
            spawners.push({ x, y });
        }
    } else {
        gridElements[xDensity][yDensity] = writeType;
    }

    renderCurrentGame();

    console.log(`Clicked on position: (${x}, ${y})`);
});

function fillGrid() {
    for (let i = 0; i < utils.num_tiles_x * constants.trackDensity; i++) {
        gridElements[i] = [];
        for (let j = 0; j < utils.num_tiles_y * constants.trackDensity; j++) {
            gridElements[i][j] = 0;
        }
    }
}

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
    renderCurrentGame();
}

// Add event listener for window resize
window.addEventListener('resize', updateResolution);

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
    for (let i = 0; i < utils.num_tiles_x * constants.trackDensity; i++) {
        for (let j = 0; j < utils.num_tiles_y * constants.trackDensity; j++) {
            data += gridElements[i][j];
            if (j < utils.num_tiles_y * constants.trackDensity - 1) {
                data += " "; // Séparer les valeurs par des espaces
            }
        }
        data += "\n";
    }
    return data;
}

function renderCurrentGame() {
    constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    renderSpawners();
    renderTerrain();
    renderCanvas();
}

function renderSpawners() {
    constants.ctxGame.fillStyle = '#FF0000'; // Couleur pour le spawner
    for (const spawner of spawners) {
        
        constants.ctxGame.beginPath();
        constants.ctxGame.arc(spawner.x * WIDTH_TILE, spawner.y * HEIGHT_TILE,
            Math.min(WIDTH_TILE, HEIGHT_TILE) / 4, 0, Math.PI * 2);
        constants.ctxGame.fill();
        constants.ctxGame.closePath();
    }
    constants.ctxGame.fillStyle = '#000000'; // Revenir à la couleur de base
}

function renderTerrain() {
    // constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    constants.ctxGame.fillStyle = '#000000';
    for (let i = 0; i < utils.num_tiles_x * constants.trackDensity; i++) {
        for (let j = 0; j < utils.num_tiles_y * constants.trackDensity; j++) {
            if (gridElements[i][j] === 1) {
                constants.ctxGame.fillRect(i * WIDTH_TILE / constants.trackDensity - WIDTH_TILE / (2 * constants.trackDensity),
                    j * HEIGHT_TILE / constants.trackDensity - HEIGHT_TILE / (2 * constants.trackDensity),
                    WIDTH_TILE / constants.trackDensity,
                    HEIGHT_TILE / constants.trackDensity);
            }
            if (gridElements[i][j] === 2) {
                constants.ctxGame.fillStyle = '#FF0000'; // Couleur pour le spawner
                constants.ctxGame.fillRect(i * WIDTH_TILE / constants.trackDensity - WIDTH_TILE / (2 * constants.trackDensity),
                    j * HEIGHT_TILE / constants.trackDensity - HEIGHT_TILE / (2 * constants.trackDensity),
                    WIDTH_TILE / constants.trackDensity,
                    HEIGHT_TILE / constants.trackDensity);
                constants.ctxGame.fillStyle = '#000000'; // Revenir à la couleur de base
            }
        }
    }
}
function renderCanvas() {
    constants.ctxGame.strokeStyle = '#000000';
    constants.ctxGame.lineWidth = strokeWidth;
    for (let i = 0; i <= utils.num_tiles_x; i++) {
        constants.ctxGame.beginPath();
        constants.ctxGame.moveTo(i * WIDTH_TILE, 0);
        constants.ctxGame.lineTo(i * WIDTH_TILE, constants.touchCanvas.height);
        constants.ctxGame.stroke();
    }
    for (let j = 0; j <= utils.num_tiles_y; j++) {
        constants.ctxGame.beginPath();
        constants.ctxGame.moveTo(0, j * HEIGHT_TILE);
        constants.ctxGame.lineTo(constants.touchCanvas.width, j * HEIGHT_TILE);
        constants.ctxGame.stroke();
    }
}