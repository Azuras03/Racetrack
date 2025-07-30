let num_tiles_x = 45;
let num_tiles_y = 25;
let widthTile = 20; // Largeur d'une tile
let heightTile = 20; // Hauteur d'une tile
let trackDensity = 2; // Densité, donc en gros pour une grille, on a densité^2 éléments dans une tile
let gridElements = [];
let players = [];
let spawners = [];
let zoom = .95;

let widthCanvas = 0;
let heightCanvas = 0;

let aspect = 0;

let playerStrokeWidth = 0; // Largeur du trait pour le rendu des chemins
let playerRadius = 0; // Rayon du cercle pour le rendu des joueurs
let strokeWidth = 0; // Largeur du trait pour le rendu des chemins


export const utils = {
    num_tiles_x,
    num_tiles_y,
    widthTile,
    heightTile,
    trackDensity,
    gridElements,
    players,
    spawners,
    widthCanvas,
    heightCanvas,
    aspect,
    playerStrokeWidth,
    playerRadius,
    strokeWidth,
    zoom,
}