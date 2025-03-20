document.addEventListener("DOMContentLoaded", function () {
    const playerGrid = document.getElementById('player-grid');
    const opponentGrid = document.getElementById('opponent-grid');
    const playerShipsLeftDisplay = document.getElementById('player-ships-left');
    const opponentShipsLeftDisplay = document.getElementById('opponent-ships-left');
    const retryButton = document.getElementById('retry');

    if (!playerGrid || !opponentGrid || !playerShipsLeftDisplay || !opponentShipsLeftDisplay || !retryButton) {
        console.error("❌ عنصر واحد أو أكثر غير موجود في DOM. تحقق من الـ HTML.");
        return;
    }

    console.log("✅ كل العناصر موجودة، يتم بدء اللعبة...");
    initializeGame(playerGrid, opponentGrid, playerShipsLeftDisplay, opponentShipsLeftDisplay);

    retryButton.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'restart' }));
        }
        location.reload();
    });
});

const gridSize = 10;
const shipColors = ['red', 'orange', 'purple', 'brown'];
let socket;

const playerShips = [
    { size: 5, positions: new Set(), color: shipColors[0], hitPositions: new Set() },
    { size: 4, positions: new Set(), color: shipColors[1], hitPositions: new Set() },
    { size: 3, positions: new Set(), color: shipColors[2], hitPositions: new Set() },
    { size: 2, positions: new Set(), color: shipColors[3], hitPositions: new Set() }
];

let playerTotalShipsLeft = playerShips.length;
let opponentTotalShipsLeft = playerShips.length;

function initializeGame(playerGrid, opponentGrid, playerShipsLeftDisplay, opponentShipsLeftDisplay) {
    playerGrid.innerHTML = '';
    opponentGrid.innerHTML = '';
    resetShips(playerShips);
    placeShips(playerShips);
    createGrid(playerGrid, playerShips, false);
    createGrid(opponentGrid, [], true);
    updateDisplays(playerShipsLeftDisplay, opponentShipsLeftDisplay);
    setupWebSocket();
}

function updateDisplays(playerShipsLeftDisplay, opponentShipsLeftDisplay) {
    playerShipsLeftDisplay.innerHTML = `Your Ships Left: ${playerTotalShipsLeft}`;
    opponentShipsLeftDisplay.innerHTML = `Opponent Ships Left: ${opponentTotalShipsLeft}`;
}

function resetShips(ships) {
    ships.forEach(ship => {
        ship.positions.clear();
        ship.hitPositions.clear();
    });
}

function placeShips(ships) {
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

function createGrid(gridElement, ships, isOpponentGrid) {
    gridElement.style.display = 'grid';
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, minmax(25px, 1fr))`;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.dataset.position = `${row}-${col}`;
            cell.style.width = '100%';
            cell.style.aspectRatio = '1 / 1';
            cell.style.backgroundColor = 'lightgray';
            if (!isOpponentGrid) {
                ships.forEach(ship => {
                    if (ship.positions.has(cell.dataset.position)) {
                        cell.style.backgroundColor = 'darkgray';
                    }
                });
            }
            if (isOpponentGrid) {
                cell.addEventListener('click', () => sendAttack(cell.dataset.position));
            }
            gridElement.appendChild(cell);
        }
    }
}

function setupWebSocket() {
    socket = new WebSocket('ws://your-websocket-server');

    socket.onopen = () => {
        console.log("✅ WebSocket Connected!");
    };

    socket.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
    };

    socket.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.type === 'attack') {
            handleIncomingAttack(data.position);
        }
    };
}

function sendAttack(position) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'attack', position }));
    } else {
        console.error("❌ WebSocket غير متصل.");
    }
}

function handleIncomingAttack(position) {
    const cell = document.querySelector(`#player-grid [data-position='${position}']`);
    if (cell && cell.style.backgroundColor === 'darkgray') {
        cell.style.backgroundColor = 'black';
        playerTotalShipsLeft--;
    } else {
        cell.style.backgroundColor = 'blue';
    }
    updateDisplays();
}

function handlePlayerAttack(cell) {
    if (cell.style.backgroundColor !== 'yellow') return;
    sendAttack(cell.dataset.position);
    cell.style.backgroundColor = 'blue';
    disablePlayerBoard();
}

function handleOpponentAttack(position) {
    const cell = document.querySelector(`#player-grid [data-position='${position}']`);
    if (!cell) return;
    cell.style.backgroundColor = 'black';
    enablePlayerBoard();
}

function disablePlayerBoard() {
    const playerGrid = document.getElementById('player-grid');
    playerGrid.style.pointerEvents = 'none';
    playerGrid.style.opacity = '0.5';
}

function enablePlayerBoard() {
    const playerGrid = document.getElementById('player-grid');
    playerGrid.style.pointerEvents = 'auto';
    playerGrid.style.opacity = '1';
}
