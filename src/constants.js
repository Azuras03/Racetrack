const game = document.getElementById("game");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasPath = document.getElementById("path");
const ctxPath = canvasPath.getContext("2d");

export {
    game,
    canvas,
    ctx,
    canvasPath,
    ctxPath,
}