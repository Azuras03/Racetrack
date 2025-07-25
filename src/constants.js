const game = document.getElementById("game");
const touchCanvas = document.getElementById("touchCanvas");
const ctxTouch = touchCanvas.getContext("2d");
const pathCanvas = document.getElementById("pathCanvas");
const ctxPath = pathCanvas.getContext("2d");
const gameCanvas = document.getElementById("gameCanvas");
const ctxGame = gameCanvas.getContext("2d");
const exportButton = document.getElementById("exportButton");
const importButton = document.getElementById("importButton");
const NUM_TILES_X = 30;
const NUM_TILES_Y = 20;
const trackDensity = 2; // Densité, donc en gros pour une grille, on a densité^2 éléments dans une tile

export {
    game,
    touchCanvas,
    ctxTouch,
    pathCanvas,
    ctxPath,
    gameCanvas,
    ctxGame,
    NUM_TILES_X,
    NUM_TILES_Y,
    trackDensity,
    exportButton,
    importButton
}