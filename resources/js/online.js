const playerGrid = document.getElementById('player-grid');
const opponentGrid = document.getElementById('opponent-grid');


// const playerShipsLeftDisplay = document.getElementById('player-ships-left');
// const computerShipsLeftDisplay = document.getElementById('computer-ships-left');



const gridSize = 10;

const shipColors = ['red', 'orange', 'purple', 'brown', 'navy', 'green'];

const playerShips = [
    { size: 5, positions: new Set(), color: shipColors[0], hitPositions: new Set() },
    { size: 4, positions: new Set(), color: shipColors[1], hitPositions: new Set() },
    { size: 4, positions: new Set(), color: shipColors[2], hitPositions: new Set() },
    { size: 3, positions: new Set(), color: shipColors[3], hitPositions: new Set() },
    { size: 3, positions: new Set(), color: shipColors[4], hitPositions: new Set() },
    { size: 2, positions: new Set(), color: shipColors[5], hitPositions: new Set() }
];
const opponentShips = [
    { size: 5, positions: new Set(), color: shipColors[0], hitPositions: new Set() },
    { size: 4, positions: new Set(), color: shipColors[1], hitPositions: new Set() },
    { size: 4, positions: new Set(), color: shipColors[2], hitPositions: new Set() },
    { size: 3, positions: new Set(), color: shipColors[3], hitPositions: new Set() },
    { size: 3, positions: new Set(), color: shipColors[4], hitPositions: new Set() },
    { size: 2, positions: new Set(), color: shipColors[5], hitPositions: new Set() }
];



export const initializeBoards = () => {
    playerGrid.innerHTML = '';
    opponentGrid.innerHTML = ''
    placeShips(playerShips);
    placeShips(opponentShips);
    createGrid(playerGrid, playerShips, false);
    createGrid(opponentGrid, opponentShips, true);

};

export function placeShips(ships) {
    ships.forEach(ship => {
        let isPlaced = false;
        while (!isPlaced) {
            const isHorizontal = Math.random() < 0.5;
            const startRow = isHorizontal ? Math.floor(Math.random() * gridSize) : Math.floor(Math.random() * (gridSize - ship.size + 1));
            const startCol = isHorizontal ? Math.floor(Math.random() * (gridSize - ship.size + 1)) : Math.floor(Math.random() * gridSize);
            let canPlace = true;
            for (let i = 0; i < ship.size; i++) {
                const position = isHorizontal ? `${startRow}-${startCol + i}` : `${startRow + i}-${startCol}`;
                if (isPositionOccupied(position, ships)) {
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
}

function isPositionOccupied(position, ships) {
    return ships.some(ship => ship.positions.has(position));
}

function createGrid(gridElement, ships, isopponentGrid) {
    gridElement.style.display = 'grid';
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, minmax(25px, 1fr))`;
    gridElement.style.gap = '5px';
    gridElement.style.maxWidth = '90vw';

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add("grid-cell"); // ✅ إضافة كلاس لتعريف الخلايا
            cell.style.width = '100%';
            cell.style.aspectRatio = '1 / 1';
            cell.style.backgroundColor = 'lightgray';
            cell.style.cursor = 'pointer';
            cell.style.borderRadius = '5px';
            cell.dataset.position = `${row}-${col}`;
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (!isopponentGrid) {
                ships.forEach(ship => {
                    if (ship.positions.has(cell.dataset.position)) {
                        cell.style.backgroundColor = 'darkgray';
                    }
                });

                cell.addEventListener("dragover", (event) => {
                    event.preventDefault();
                    const targetCell = event.target.closest(".grid-cell"); // ✅ البحث عن الكلاس الصحيح
                    if (!targetCell) {
                        console.log('null')
                    };

                    const shipIndex = event.dataTransfer.getData("shipIndex"); // ✅ استرجاع `shipIndex`
                    const isHorizontal = event.dataTransfer.getData("isHorizontal") === "true";

                    if (!shipIndex) {
                        console.error("❌ shipIndex غير متوفر في dragover!", { shipIndex, event });
                        return;
                    }

                    const row = parseInt(targetCell.dataset.row, 10);
                    const col = parseInt(targetCell.dataset.col, 10);

                    highlightPotentialPlacement(row, col, parseInt(shipIndex, 10), isHorizontal);
                });

            }

            if (isopponentGrid) {
                cell.addEventListener('mouseover', () => {
                    if (cell.style.backgroundColor === 'lightgray') {
                        cell.style.backgroundColor = 'yellow';
                    }
                });
                cell.addEventListener('mouseout', () => {
                    if (cell.style.backgroundColor === 'yellow') {
                        cell.style.backgroundColor = 'lightgray';
                    }
                });
                cell.addEventListener('click', () => handlePlayerAttack(cell, ships));
            }

            gridElement.appendChild(cell);
        }
    }
}

export const handlePlayerAttack = (cell, ships) => {
    if (cell.style.backgroundColor !== 'yellow') return;


    let isShipHit = false;


    // 🔍 البحث عن السفن وضربها
    ships.forEach(ship => {
        if (ship.positions.has(cell.dataset.position)) {
            cell.style.backgroundColor = 'black';
            cell.innerHTML = '🔥';
            ship.hitPositions.add(cell.dataset.position);

            if (ship.hitPositions.size === ship.size) {
                ship.positions.forEach(pos => {
                    let shipCell = document.querySelector(`#computer-grid [data-position="${pos}"]`);
                    shipCell.style.backgroundColor = 'red';
                    shipCell.innerHTML = '🚢';
                });
                // computerTotalShipsLeft--;
                updateDisplays();
            }
            isShipHit = true;
        }
    });

    // ✅ لا تغيّر لون الكنز إلى الأزرق
    if (!isShipHit) {
        cell.style.backgroundColor = 'blue';
        // setTimeout(() => {
            
        //     computerTurn();
        // }, 500);
    } else {
        
    }

    // updateDisplays();
    // if (computerTotalShipsLeft === 0) {
    //     alert('🎉 Player Wins!');
    //     sendScoreToDatabase(100, 1, 0, 0, "vsComputer");
    //     setTimeout(() => {
            
    //         initializeGame();
    //     }, 1000);
    // }
}
export const updateAttackResult = (coordinate, result, opponentGrid) => {
    const [row, col] = coordinate.split(',');
    const cell = opponentGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add(result);
};
