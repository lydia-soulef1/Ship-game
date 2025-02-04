const container = document.getElementById('grid-container');
const retryButton = document.getElementById('retry');
const wrongAttemptsDisplay = document.getElementById('wrong-attempts');
const shipsToDestroyDisplay = document.getElementById('ships-to-destroy');
const gridSize = 10;
const maxWrongAttempts = 35;
let wrongAttempts = 0;
const shipColors = ['red', 'orange', 'purple', 'brown'];

const ships = [
    { size: 5, positions: new Set(), color: shipColors[0], hitPositions: new Set() },
    { size: 4, positions: new Set(), color: shipColors[1], hitPositions: new Set() },
    { size: 3, positions: new Set(), color: shipColors[2], hitPositions: new Set() },
    { size: 2, positions: new Set(), color: shipColors[3], hitPositions: new Set() }
];

let totalShipsFound = 0;

function initializeGame() {
    totalShipsFound = 0;
    wrongAttempts = 0;
    wrongAttemptsDisplay.textContent = `Try: ${wrongAttempts}/${maxWrongAttempts}`;
    shipsToDestroyDisplay.innerHTML = `<strong>Rest Ship:</strong> ${ships.length}`;
    container.innerHTML = '';

    ships.forEach(ship => {
        ship.positions.clear();
        ship.hitPositions.clear();
    });

    ships.forEach(ship => {
        let isPlaced = false;
        while (!isPlaced) {
            const isHorizontal = Math.random() < 0.5;
            const startRow = isHorizontal ? Math.floor(Math.random() * gridSize) : Math.floor(Math.random() * (gridSize - ship.size + 1));
            const startCol = isHorizontal ? Math.floor(Math.random() * (gridSize - ship.size + 1)) : Math.floor(Math.random() * gridSize);

            let canPlace = true;
            for (let i = 0; i < ship.size; i++) {
                const position = isHorizontal ? `${startRow}-${startCol + i}` : `${startRow + i}-${startCol}`;
                if (isPositionOccupied(position)) {
                    canPlace = false;
                    break;
                }
            }

            if (canPlace) {
                for (let i = 0; i < ship.size; i++) {
                    const position = isHorizontal ? `${startRow}-${startCol + i}` : `${startRow + i}-${startCol}`;
                    ship.positions.add(position);
                }
                isPlaced = true;
            }
        }
    });

    const gridWrapper = document.createElement('div');
    gridWrapper.style.display = 'grid';
    gridWrapper.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
    gridWrapper.style.gap = '5px';


    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.style.width = '40px';
            cell.style.height = '40px';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontWeight = 'bold';
            cell.style.backgroundColor = 'lightgray';
            cell.style.backgroundColor.hover = 'black';
            cell.style.cursor = 'pointer';

            cell.addEventListener('mouseover', () => {
                if (cell.style.backgroundColor === 'lightgray') {
                    cell.style.backgroundColor = 'rgb(136, 130, 130)';
                }
            });

            cell.addEventListener('mouseout', () => {
                if (cell.style.backgroundColor === 'rgb(136, 130, 130)') {
                    cell.style.backgroundColor = 'lightgray';
                }
            });


            cell.dataset.position = `${row}-${col}`;

            cell.addEventListener('click', () => {
                if (cell.style.backgroundColor !== 'rgb(136, 130, 130)') return;
                if (wrongAttempts >= maxWrongAttempts) return;

                let isShipHit = false;
                ships.forEach(ship => {
                    if (ship.positions.has(cell.dataset.position)) {
                        cell.textContent = '🚢';
                        cell.style.backgroundColor = 'black';
                        ship.hitPositions.add(cell.dataset.position);

                        if (ship.hitPositions.size === ship.size) {
                            ship.hitPositions.forEach(pos => {
                                document.querySelector(`[data-position="${pos}"]`).style.backgroundColor = ship.color;
                            });
                            totalShipsFound++;
                            shipsToDestroyDisplay.innerHTML = `<strong>Rest Ship:</strong> ${ships.length - totalShipsFound}`;
                            if (totalShipsFound === ships.length) {
                                revealShips();
                                alert('🎉 You Win 🎉');
                                container.childNodes.forEach(b => b.style.pointerEvents = 'none');
                            }
                        }
                        isShipHit = true;
                    }
                });

                if (!isShipHit) {
                    cell.textContent = '💧';
                    cell.style.backgroundColor = 'blue';
                    wrongAttempts++;
                    wrongAttemptsDisplay.textContent = `Try: ${wrongAttempts}/${maxWrongAttempts}`;

                    if (wrongAttempts >= maxWrongAttempts) {
                        revealShips();
                        alert('❌! Game Over!');
                        container.childNodes.forEach(b => b.style.pointerEvents = 'none');
                    }
                }
            });

            container.appendChild(cell);
        }
    }
}

function isPositionOccupied(position) {
    return ships.some(ship => ship.positions.has(position));
}

function revealShips() {
    ships.forEach(ship => {
        ship.positions.forEach(pos => {
            const cell = document.querySelector(`[data-position="${pos}"]`);
            if (cell) {
                cell.style.backgroundColor = ship.color;
                // cell.textContent = '🚢';
            }
        });
    });
}

retryButton.addEventListener('click', initializeGame);



initializeGame();
