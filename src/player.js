import * as constants from './constants.js';
import { utils } from './utils.js';

class Player {
    constructor(x, y, color) {
        this.color = color;
        this.position = { x: x, y: y };
        this.speedX = 0;
        this.speedY = 0;
        this.predictivePosition = { x: x, y: y };
        this.possibleMoves = [];
        this.moves = [{ x: x, y: y, stop:0 }]; // Initialize with the starting position
        this.stun = 0; // Stun duration
        this.hasWin = false; // Flag to check if the player has won
    }

    getMoves(terrain) {
        if (this.hasWin) return; // Si on a gagné, pas besoin de chercher de moves
        this.possibleMoves = [];
        this.calculatePredictivePosition(terrain);
        for (let dx = -1; dx <= 1; dx++) {
            let newX = this.predictivePosition.x + dx;

            if (newX < 0 || newX >= utils.num_tiles_x) continue; // Vérification de la validité de newX

            for (let dy = -1; dy <= 1; dy++) {
                let newY = this.predictivePosition.y + dy;

                if (newX < 0 || newX >= utils.num_tiles_x) continue; // Vérification de la validité de newX

                if (newY == this.position.y && newX == this.position.x) continue; // Ne pas inclure la position actuelle

                // Check de si la position prédictive touche un bout de terrain. Si c'est le cas,
                // le joueur perdra toute sa vitesse
                let terrainTouch = terrain[utils.trackDensity * newX][utils.trackDensity * newY];
                // Ce cas signifie que la voiture vient de se crasher, donc ne peut pas aller encore sur du bitume
                this.possibleMoves.push({ x: newX, y: newY, stop: terrainTouch });
            }
        }

        // Check if the predictive position is at the edge of the grid
        let isAtEdge = this.isAtEdge(this.predictivePosition.x, this.predictivePosition.y);
        if (isAtEdge) {
            let x = Math.max(0, Math.min(utils.num_tiles_x - 1, this.predictivePosition.x));
            let y = Math.max(0, Math.min(utils.num_tiles_y - 1, this.predictivePosition.y));
            this.possibleMoves.push({ x: x, y: y, stop: 1 });
        }

        let finalMoves = [];
        // Modifier tous ses mouvements en faisant du raycasting pour vérifier si on peut aller à cette position
        for (let move of this.possibleMoves) {
            let isGoodMove = true;
            let lengthFor = (Math.abs(move.x - this.position.x) + Math.abs(move.y - this.position.y)) * utils.trackDensity;
            lengthFor = Math.floor(lengthFor);
            // Raycasting logic to check if the path is clear
            for (let i = 0; i < lengthFor; i++) {
                let x = this.position.x + (move.x - this.position.x) * i / lengthFor;
                let y = this.position.y + (move.y - this.position.y) * i / lengthFor;
                x = Math.floor(x * utils.trackDensity);
                y = Math.floor(y * utils.trackDensity);

                // if (terrain[move.x*utils.trackDensity][move.y*utils.trackDensity] === 2){
                //     isGoodMove = true;
                //     break;
                // }

                if (terrain[x][y] === 1 || terrain[x][y] === 2) {
                    finalMoves.push({
                        x: Math.floor(x / utils.trackDensity),
                        y: Math.floor(y / utils.trackDensity),
                        stop: terrain[x][y]
                    });
                    console.log(terrain[x][y])
                    isGoodMove = false;
                    break;
                }
            }
            if (isGoodMove) {
                finalMoves.push(move);
            }
        }

        let finalFinalMoves = [];
        // Enlever les doublons
        for (let move of finalMoves) {
            if (!finalFinalMoves.some(m => m.x === move.x && m.y === move.y)) {
                finalFinalMoves.push(move);
            } else if (move.stop == 0 || move.stop == 2) {
                // Si on a un stop, on le garde
                finalFinalMoves.find(m => m.x === move.x && m.y === move.y).stop = move.stop;
            }
        }
        this.possibleMoves = finalFinalMoves;
    }

    canPlay(){
        if (this.isStunned()) {
            return false;
        }
        if (this.hasWin){
            return false;
        }   
        return true;
    }

    isStunned() {
        if (this.stun > 1) {
            this.stun--;
            return true;
        }
        if (this.stun === 1) {
            // On fait un retour en arrière
            this.stun = 0;
            // Clone the last move to keep the position
            let newMove = { x: this.moves[this.moves.length - 2].x, y: this.moves[this.moves.length - 2].y, stop: this.moves[this.moves.length - 2].stop };
            this.moves.push(newMove); // On prend l'avant-dernière position qu'on met dans le tableau à nouveau
            this.position.x = this.moves[this.moves.length - 1].x;
            this.position.y = this.moves[this.moves.length - 1].y;
            this.speedX = 0; // Reset speed
            this.speedY = 0; // Reset speed
            return true;
        }
        return false;
    }

    canMove(x, y) {
        return this.possibleMoves.some(move => move.x === x && move.y === y);
    }

    move(x, y) {
        let move = this.possibleMoves.find(move => move.x === x && move.y === y)
        if (move) {
            if (move.stop == 1) {
                this.stun = this.evaluateStunTime(Math.max(this.speedX, this.speedY));
                console.log(this.stun);
                this.speedX = 0;
                this.speedY = 0;
            } else if (move.stop == 2) {
                this.hasWin = true; // Le joueur a atteint la ligne d'arrivée
                console.log("GANIE")
            } else {
                this.speedX = x - this.position.x;
                this.speedY = y - this.position.y;
            }

            this.position.x = x;
            this.position.y = y;
            this.moves.push({ x: x, y: y, stop: move.stop });
            console.log(this.moves);
            return true;
        } else {
            return false;
        }
    }

    evaluateStunTime(speed) {
        let stunResult = 0;
        if (speed > 3) {
            stunResult = Math.floor(speed / 2);
        } else {
            stunResult = 1;
        }
        return stunResult;
    }

    isAtEdge(x, y) {
        return (x < 0 || x >= utils.num_tiles_x ||
            y < 0 || y >= utils.num_tiles_y)
    }

    calculatePredictivePosition(terrain) {
        this.predictivePosition.x = this.position.x + this.speedX;
        this.predictivePosition.y = this.position.y + this.speedY;
    }
}

export default Player;