import { utils } from './utils.js';
import * as constants from './constants.js';

let spawnerColor = 'rgb(255, 145, 0)'; // Couleur pour les spawners
let terrainColor = 'rgb(0, 36, 41)'; // Couleur pour le terrain
let finishColor = 'rgb(95, 146, 255)'; // Couleur pour le terrain d'arrivée
let gridColor = 'rgba(0, 0, 0, 0.5)'; // Couleur de la grille

export function updateResolution() {

    utils.aspect = utils.num_tiles_x / utils.num_tiles_y;

    // Faire un rendu en fonction de l'aspect ratio, pour que le canvas soit le plus grand tout en prenant la place possible sans stretch
    const curentAspect = document.documentElement.clientWidth / document.documentElement.clientHeight;

    if (curentAspect > utils.aspect) {
        constants.touchCanvas.width = document.documentElement.clientHeight * utils.aspect * utils.zoom;
        constants.touchCanvas.height = document.documentElement.clientHeight * utils.zoom;
        constants.gameCanvas.width = document.documentElement.clientHeight * utils.aspect * utils.zoom;
        constants.gameCanvas.height = document.documentElement.clientHeight * utils.zoom;
        constants.pathCanvas.width = document.documentElement.clientHeight * utils.aspect * utils.zoom;
        constants.pathCanvas.height = document.documentElement.clientHeight * utils.zoom;
    } else {
        constants.touchCanvas.width = document.documentElement.clientWidth * utils.zoom;
        constants.touchCanvas.height = document.documentElement.clientWidth / utils.aspect * utils.zoom;
        constants.gameCanvas.width = document.documentElement.clientWidth * utils.zoom;
        constants.gameCanvas.height = document.documentElement.clientWidth / utils.aspect * utils.zoom;
        constants.pathCanvas.width = document.documentElement.clientWidth * utils.zoom;
        constants.pathCanvas.height = document.documentElement.clientWidth / utils.aspect * utils.zoom;
    }
    utils.widthCanvas = constants.touchCanvas.width;
    utils.heightCanvas = constants.touchCanvas.height;

    utils.widthTile = utils.widthCanvas / (utils.num_tiles_x - 1);
    utils.heightTile = utils.heightCanvas / (utils.num_tiles_y - 1);

    let referValue = Math.min(utils.widthTile, utils.heightTile);

    utils.strokeWidth = referValue / 15; // Largeur du trait pour le rendu des chemins
    utils.playerStrokeWidth = referValue / 10; // Largeur du trait pour le rendu
    utils.playerRadius = referValue / 3; // Rayon du cercle pour le rendu des joueurs
}

export function renderTerrain(ctx) {
    ctx.fillStyle = terrainColor; // Couleur pour le terrain
    for (let i = 0; i < utils.num_tiles_x * utils.trackDensity; i++) {
        for (let j = 0; j < utils.num_tiles_y * utils.trackDensity; j++) {
            if (utils.gridElements[i][j] === 0) {
                continue;
            }
            if (utils.gridElements[i][j] === 1) {
                ctx.fillStyle = terrainColor; // Couleur pour le terrain
            }
            if (utils.gridElements[i][j] === 2) {
                ctx.fillStyle = finishColor; // Couleur pour le terrain d'arrivée
            }
            ctx.fillRect(i * utils.widthTile / utils.trackDensity - utils.widthTile / (2 * utils.trackDensity),
                j * utils.heightTile / utils.trackDensity - utils.heightTile / (2 * utils.trackDensity),
                utils.widthTile / utils.trackDensity,
                utils.heightTile / utils.trackDensity);
        }
    }
}

export function renderCanvas(ctx) {
    ctx.strokeStyle = gridColor; // Couleur de la grille
    ctx.lineWidth = utils.strokeWidth;
    for (let i = 0; i <= utils.num_tiles_x; i++) {
        ctx.beginPath();
        ctx.moveTo(i * utils.widthTile, 0);
        ctx.lineTo(i * utils.widthTile, constants.touchCanvas.height);
        ctx.stroke();
    }
    for (let j = 0; j <= utils.num_tiles_y; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * utils.heightTile);
        ctx.lineTo(constants.touchCanvas.width, j * utils.heightTile);
        ctx.stroke();
    }
}

export function renderPath(player, ctx) {
    ctx.strokeStyle = player.color;
    ctx.lineWidth = utils.playerStrokeWidth;

    ctx.beginPath();
    ctx.moveTo(player.moves[0].x * utils.widthTile,
        player.moves[0].y * utils.heightTile);
    for (let move of player.moves) {
        // Draw a line from the move position to the current player position
        ctx.lineTo(move.x * utils.widthTile,
            move.y * utils.heightTile);
        ctx.stroke();
        if (move.stop === 1) { // Dessin d'une croix pour les mouvements qui s'arrêtent
            ctx.beginPath();
            ctx.moveTo(move.x * utils.widthTile - utils.playerRadius / 2,
                move.y * utils.heightTile - utils.playerRadius / 2);
            ctx.lineTo(move.x * utils.widthTile + utils.playerRadius / 2,
                move.y * utils.heightTile + utils.playerRadius / 2);
            ctx.moveTo(move.x * utils.widthTile + utils.playerRadius / 2,
                move.y * utils.heightTile - utils.playerRadius / 2);
            ctx.lineTo(move.x * utils.widthTile - utils.playerRadius / 2,
                move.y * utils.heightTile + utils.playerRadius / 2);
            ctx.stroke();
            ctx.moveTo(move.x * utils.widthTile,
                move.y * utils.heightTile);
        }
    }
}

export function renderSpawners(ctx) {
    ctx.fillStyle = spawnerColor; // Couleur pour le spawner
    for (const spawner of utils.spawners) {
        ctx.beginPath();
        ctx.arc(spawner.x * utils.widthTile, spawner.y * utils.heightTile,
            Math.min(utils.widthTile, utils.heightTile) / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    ctx.fillStyle = '#000000'; // Revenir à la couleur de base
}

export function renderPlayerMoves(player, ctx) {
    player.possibleMoves.forEach(move => {
        if (move.stop === 1) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Couleur pour les mouvements qui s'arrêtent
        } else if (move.stop === 0) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // Couleur pour les mouvements possibles
        } else if (move.stop === 2) {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; // Couleur pour la ligne d'arrivée
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Couleur par défaut
        }
        ctx.beginPath();
        ctx.arc(move.x * utils.widthTile, move.y * utils.heightTile, utils.playerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = ctx.fillStyle; // Utiliser la même couleur pour le contour
        ctx.lineWidth = utils.playerStrokeWidth;
        ctx.stroke();
        ctx.closePath();
    });
}

export function renderPlayer(player, ctx) {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.position.x * utils.widthTile, player.position.y * utils.heightTile, utils.playerRadius, 0, Math.PI * 2);
    ctx.fill();
}
