class Player {
    constructor(name, color) {
        this.color = color;
        this.position = { x: 0, y: 0 };
        this.speedX = 0;
        this.speedY = 0;
        this.predictivePosition = { x: 0, y: 0 };
        this.moves = [];
    }

    getMoves() {
        this.moves = [];
        this.calculatePredictivePosition();
        // Ajouter les combinaisons de +1 et -1 predictiveX et Y
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                this.moves.push({ x: this.predictivePosition.x + dx, y: this.predictivePosition.y + dy });
            }
        }
    }

    move(x, y){
        if (this.moves.some(move => move.x === x && move.y === y)) {
            this.speedX = x - this.position.x;
            this.speedY = y - this.position.y;

            this.position.x = x;
            this.position.y = y;
        }
    }

    calculatePredictivePosition() {
        this.predictivePosition.x = this.position.x + this.speedX;
        this.predictivePosition.y = this.position.y + this.speedY;
    }
}

export default Player;