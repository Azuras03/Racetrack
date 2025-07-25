class Player {
    constructor(x,y,color) {
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
        // Ajouter les combinaisons de +1 et -1 predictiveX et Y
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                this.possibleMoves.push({ x: this.predictivePosition.x + dx, y: this.predictivePosition.y + dy });
            }
        }
    }

    move(x, y){
        if (this.possibleMoves.some(move => move.x === x && move.y === y)) {
            this.speedX = x - this.position.x;
            this.speedY = y - this.position.y;

            this.position.x = x;
            this.position.y = y;
            this.moves.push({ x: x, y: y });
        }
    }

    calculatePredictivePosition() {
        this.predictivePosition.x = this.position.x + this.speedX;
        this.predictivePosition.y = this.position.y + this.speedY;
    }
}

export default Player;