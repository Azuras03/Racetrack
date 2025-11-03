import * as constants from './constants.js';
import { utils } from './utils.js';
import * as canvas from './canvas.js';
let mousedown = false;

let writeType = 1; // 1 = pencil, 0 = eraser, 2 = spawner
let pencilSize = constants.pencilSizeSelector.value; // Taille du crayon

utils.num_tiles_x = constants.widthSelector.value;
utils.num_tiles_y = constants.heightSelector.value;

fillGrid();
canvas.updateResolution();
renderCurrentGame();

constants.pencil.addEventListener('click', () => {
    constants.pencil.classList.add('active');
    constants.endPencil.classList.remove('active');
    constants.eraser.classList.remove('active');
    constants.clearButton.classList.remove('active');
    constants.spawner.classList.remove('active');
    writeType = 1; // Pencil
});

constants.eraser.addEventListener('click', () => {
    constants.pencil.classList.remove('active');
    constants.endPencil.classList.remove('active');
    constants.eraser.classList.add('active');
    constants.clearButton.classList.remove('active');
    constants.spawner.classList.remove('active');
    writeType = 0; // Eraser
    console.log("Eraser selected");
});

constants.endPencil.addEventListener('click', () => {
    constants.pencil.classList.remove('active');
    constants.eraser.classList.remove('active');
    constants.endPencil.classList.add('active');
    constants.clearButton.classList.remove('active');
    constants.spawner.classList.remove('active');
    writeType = 2; // End Pencil
    console.log("End Pencil selected");
});

constants.spawner.addEventListener('click', () => {
    constants.pencil.classList.remove('active');
    constants.endPencil.classList.remove('active');
    constants.eraser.classList.remove('active');
    constants.clearButton.classList.remove('active');
    constants.spawner.classList.add('active');
    writeType = 3; // Spawner
    console.log("Spawner selected");
});

constants.clearButton.addEventListener('click', () => {
    fillGrid();
    utils.spawners = [];
    renderCurrentGame();
    console.log("Grid cleared");
});

constants.widthSelector.addEventListener('change', (event) => {
    const newWidth = parseInt(event.target.value);
    utils.num_tiles_x = newWidth;
    canvas.updateResolution();
    fillGrid();
    renderCurrentGame();
});

constants.heightSelector.addEventListener('change', (event) => {
    const newHeight = parseInt(event.target.value);
    utils.num_tiles_y = newHeight;
    canvas.updateResolution();
    fillGrid();
    renderCurrentGame();
});

constants.densitySelector.addEventListener('change', (event) => {
    utils.trackDensity = parseInt(event.target.value);
    fillGrid()
    renderCurrentGame()
})

constants.pencilSizeSelector.addEventListener('change', (event) => {
    pencilSize = parseInt(event.target.value);
})

constants.touchCanvas.addEventListener('mousedown', (event) => {
    mousedown = true;
    handleDraw(event.clientX, event.clientY)
});

constants.touchCanvas.addEventListener('mouseup', (event) => {
    mousedown = false;
});


// Tactile (mobile)
constants.touchCanvas.addEventListener('touchstart', (event) => {
    mousedown = true;
    if (event.touches.length > 1) return;
    const touch = event.touches[0];
    handleDraw(touch.clientX, touch.clientY);
});
constants.touchCanvas.addEventListener('touchend', () => {
    mousedown = false;
});
constants.touchCanvas.addEventListener('touchmove', (event) => {
    if (!mousedown) return;
    if (event.touches.length > 1) return;
    const touch = event.touches[0];
    handleDraw(touch.clientX, touch.clientY);
});

// Event quand on reste appuyé sur le canvas, pour dessiner des routes
constants.touchCanvas.addEventListener('mousemove', (event) => {
    if (!mousedown) return;
    handleDraw(event.clientX, event.clientY)
});

constants.touchCanvas.addEventListener('mousemove', (event) => {
    // Show a circle at the mouse position
    const rect = constants.pathCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    constants.ctxPath.clearRect(0, 0, constants.pathCanvas.width, constants.pathCanvas.height);
    constants.ctxPath.beginPath();
    constants.ctxPath.arc(x, y, pencilSize * utils.widthTile / utils.trackDensity / 2, 0, Math.PI * 2);
    constants.ctxPath.fillStyle = 'rgba(0, 0, 0, 0.5)';
    constants.ctxPath.fill();
    constants.ctxPath.stroke();
    constants.ctxPath.closePath();
    constants.ctxPath.fillStyle = 'black';
    constants.ctxPath.font = '16px Arial';
});

function handleDraw(clientX, clientY) {
    const rect = constants.touchCanvas.getBoundingClientRect();

    let x = Math.floor((clientX - rect.left + utils.widthTile / 2) / utils.widthTile);
    let y = Math.floor((clientY - rect.top + utils.heightTile / 2) / utils.heightTile);
    let xDensity = Math.floor((clientX - rect.left + utils.widthTile / 2) / utils.widthTile * utils.trackDensity);
    let yDensity = Math.floor((clientY - rect.top + utils.heightTile / 2) / utils.heightTile * utils.trackDensity);

    console.log(`Mouse moved to position: (${x}, ${y})`);
    console.log(`Mouse moved to density position: (${xDensity}, ${yDensity})`);
    if (writeType === 3) {
        // Si on est en mode spawner, on ajoute un spawner
        if (!utils.spawners.some(spawner => spawner.x === x && spawner.y === y)) {
            utils.spawners.push({ x, y });
        }
    } else {
        for (let i = -pencilSize / 2; i < pencilSize / 2; i++) {
            for (let j = -pencilSize / 2; j < pencilSize / 2; j++) {
                const writeX = Math.floor(xDensity + i);
                const writeY = Math.floor(yDensity + j);
                writeOnGrid(writeX, writeY, writeType);
            }
        }
        if (writeType === 0) { // Eraser mode, mais pour les spawners
            if (utils.spawners.some(spawner => spawner.x === x && spawner.y === y)) {
                utils.spawners = utils.spawners.filter(spawner => !(spawner.x === x && spawner.y === y));
            }
        }
    }

    renderCurrentGame();

    console.log(`Clicked on position: (${x}, ${y})`);
}

function writeOnGrid(x, y, writeType) {
    if (x < 0 || x >= utils.num_tiles_x * utils.trackDensity ||
        y < 0 || y >= utils.num_tiles_y * utils.trackDensity)
        return;
    utils.gridElements[x][y] = writeType;
}

function fillGrid() {
    for (let i = 0; i < utils.num_tiles_x * utils.trackDensity; i++) {
        utils.gridElements[i] = [];
        for (let j = 0; j < utils.num_tiles_y * utils.trackDensity; j++) {
            utils.gridElements[i][j] = 0;
        }
    }
}
// Add event listener for window resize
window.addEventListener('resize', () => {
    canvas.updateResolution();
    renderCurrentGame();
})

constants.exportButton.addEventListener('click', () => {
    // Données du terrain qu'on mimifie
    let data = `${utils.num_tiles_x} ${utils.num_tiles_y} ${utils.trackDensity}\n<<\n`;
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

constants.saveButton.addEventListener('click', () => {
    let data = `${utils.num_tiles_x} ${utils.num_tiles_y} ${utils.trackDensity}\n<<\n`;
    data = formatTerrainData(data);
    if (!localStorage.hasOwnProperty('levels')) {
        localStorage.setItem('levels', JSON.stringify([]));
    }
    let levels = localStorage.getItem('levels');
    let levelsArray = JSON.parse(levels);
    levelsArray.push(data);
    localStorage.setItem('levels', JSON.stringify(levelsArray));
    console.log("Level saved to localStorage")
})

function formatTerrainData(data) {
    // Terrain part
    for (let i = 0; i < utils.num_tiles_x * utils.trackDensity; i++) {
        for (let j = 0; j < utils.num_tiles_y * utils.trackDensity; j++) {
            data += utils.gridElements[i][j];
            if (j < utils.num_tiles_y * utils.trackDensity - 1) {
                data += " "; // Séparer les valeurs par des espaces
            }
        }
        data += "\n";
    }

    // Spawners part
    data += "<<\n"
    for (let i = 0; i < utils.spawners.length; i++) {
        const spawner = utils.spawners[i];
        if (i == utils.spawners.length - 1) {
            data += `${spawner.x} ${spawner.y}`;
        }
        else {
            data += `${spawner.x} ${spawner.y},`;
        }
    }
    return data;
}

function renderCurrentGame() {
    constants.ctxGame.clearRect(0, 0, constants.touchCanvas.width, constants.touchCanvas.height);
    canvas.renderSpawners(constants.ctxGame);
    canvas.renderTerrain(constants.ctxGame);
    canvas.renderCanvas(constants.ctxGame);
}