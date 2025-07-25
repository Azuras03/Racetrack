const game = document.getElementById("game");
const touchCanvas = document.getElementById("touchCanvas");
const ctxTouch = touchCanvas.getContext("2d");
const pathCanvas = document.getElementById("pathCanvas");
const ctxPath = pathCanvas.getContext("2d");
const gameCanvas = document.getElementById("gameCanvas");
const ctxGame = gameCanvas.getContext("2d");

export {
    game,
    touchCanvas,
    ctxTouch,
    pathCanvas,
    ctxPath,
    gameCanvas,
    ctxGame
}