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
    }

    getMoves() {
        this.possibleMoves = [];
        this.calculatePredictivePosition();
        let isAtEdge = this.isAtEdge(this.predictivePosition.x, this.predictivePosition.y);
        if (isAtEdge) {
            let x = Math.max(0, Math.min(constants.NUM_TILES_X - 1, this.predictivePosition.x));
            let y = Math.max(0, Math.min(constants.NUM_TILES_Y - 1, this.predictivePosition.y));
            this.possibleMoves.push({ x: x, y: y, stop: isAtEdge });
        }
        // Ajouter les combinaisons de +1 et -1 predictiveX et Y
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                this.possibleMoves.push({ x: this.predictivePosition.x + dx, y: this.predictivePosition.y + dy, stop: isAtEdge});
            }
        }
    }

    move(x, y) {
        if (this.possibleMoves.some(move => move.x === x && move.y === y)) {
            if (this.possibleMoves[0].stop) {
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