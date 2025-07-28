const game = document.getElementById("game");
const touchCanvas = document.getElementById("touchCanvas");
const ctxTouch = touchCanvas.getContext("2d");
const pathCanvas = document.getElementById("pathCanvas");
const ctxPath = pathCanvas.getContext("2d");
const gameCanvas = document.getElementById("gameCanvas");
const ctxGame = gameCanvas.getContext("2d");
const mainContainer = document.getElementById("main");
const exportButton = document.getElementById("exportButton");
const importButton = document.getElementById("importButton");

const pencilSizeSelector = document.getElementById("pencilSize");
const pencil = document.getElementById("pencil");
const endPencil = document.getElementById("end");
const eraser = document.getElementById("eraser");
const spawner = document.getElementById("spawner");
const clearButton = document.getElementById("clearButton");

const widthSelector = document.getElementById("widthSelector");
const heightSelector = document.getElementById("heightSelector");

export {
    game,
    touchCanvas,
    ctxTouch,
    pathCanvas,
    ctxPath,
    gameCanvas,
    ctxGame,
    exportButton,
    importButton,
    mainContainer,
    pencilSizeSelector,
    pencil,
    eraser,
    spawner,
    clearButton,
    endPencil,
    widthSelector,
    heightSelector,
}