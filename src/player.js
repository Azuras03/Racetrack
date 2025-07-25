import * as constants from './constants.js';

class Player {
    constructor(x, y, color) {
        this.color = color;
        this.position = { x: x, y: y };
        this.speedX = 0;
        this.speedY = 0;
        this.predictivePosition = { x: x, y: y };
        this.possibleMoves = [];
        this.moves = [{ x: x, y: y }]; // Initialize with the starting position
        this.stun = 0; // Stun duration
    }

    getMoves(terrain) {
        this.possibleMoves = [];
        this.calculatePredictivePosition();

        // TODO Faire en sorte de calculer si on a un obstacle sur la ligne entre 
        // la position actuelle et la position prédictive

        for (let dx = -1; dx <= 1; dx++) {
            let newX = this.predictivePosition.x + dx;

            if (newX < 0 || newX >= constants.NUM_TILES_X) continue;

            for (let dy = -1; dy <= 1; dy++) {
                let newY = this.predictivePosition.y + dy;

                if (newX < 0 || newX >= constants.NUM_TILES_X) continue;

                // Check de si la position prédictive touche un bout de terrain. Si c'est le cas,
                // le joueur perdra toute sa vitesse
                console.log(constants.trackDensity * newX, constants.trackDensity * newY);
                console.log(terrain)
                let isOnTerrain = terrain[constants.trackDensity * newX][constants.trackDensity * newY] === 1
                this.possibleMoves.push({ x: newX, y: newY, stop: isOnTerrain });
            }
        }

        // Check if the predictive position is at the edge of the grid
        let isAtEdge = this.isAtEdge(this.predictivePosition.x, this.predictivePosition.y);
        if (isAtEdge) {
            let x = Math.max(0, Math.min(constants.NUM_TILES_X - 1, this.predictivePosition.x));
            let y = Math.max(0, Math.min(constants.NUM_TILES_Y - 1, this.predictivePosition.y));
            this.possibleMoves.push({ x: x, y: y, stop: isAtEdge });
        }
    }

    canMove(x, y) {
        return this.possibleMoves.some(move => move.x === x && move.y === y);
    }

    move(x, y) {
        if (this.possibleMoves.some(move => move.x === x && move.y === y)) {
            if (this.possibleMoves.find(move => move.x === x && move.y === y).stop) {
                this.stun = this.evaluateStunTime(Math.max(this.speedX, this.speedY));
                this.speedX = 0;
                this.speedY = 0;
            } else {
                this.speedX = x - this.position.x;
                this.speedY = y - this.position.y;
            }

            this.position.x = x;
            this.position.y = y;
            this.moves.push({ x: x, y: y });
        }
    }

    evaluateStunTime(speed){
        let stunResult = 0;
        if (speed > 0) {
            stunResult = Math.floor(speed/2);
        } else {
            stunResult = 1;
        }
        return stunResult;
    }

    isAtEdge(x, y) {
        return (x < 0 || x >= constants.NUM_TILES_X ||
            y < 0 || y >= constants.NUM_TILES_Y)
    }

    calculatePredictivePosition() {
        this.predictivePosition.x = this.position.x + this.speedX;
        this.predictivePosition.y = this.position.y + this.speedY;
    }
}

export default Player;