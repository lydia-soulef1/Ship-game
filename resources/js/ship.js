const playerGrid = document.getElementById('player-grid');
const computerGrid = document.getElementById('computer-grid');
const retryButton = document.getElementById('retry');
const playerAttemptsDisplay = document.getElementById('player-attempts');
const computerAttemptsDisplay = document.getElementById('computer-attempts');
const playerShipsLeftDisplay = document.getElementById('player-ships-left');
const computerShipsLeftDisplay = document.getElementById('computer-ships-left');

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

const computerShips = JSON.parse(JSON.stringify(playerShips));
let playerTotalShipsLeft = playerShips.length;
let computerTotalShipsLeft = computerShips.length;

let tresor = { position: null };

function initializeGame() {
    playerTotalShipsLeft;
    computerTotalShipsLeft;
    updateDisplays();
    playerGrid.innerHTML = '';
    computerGrid.innerHTML = '';
    resetShips(playerShips);
    resetShips(computerShips);
    placeShips(playerShips);
    placeShips(computerShips);
    placeTresor(tresor);
    console.log("🔍 Final tresor position after placement:", tresor.position);
    createGrid(playerGrid, playerShips, false);
    createGrid(computerGrid, computerShips, true, tresor);

}

function updateDisplays() {
    playerShipsLeftDisplay.innerHTML = `Player Ships Left: ${playerTotalShipsLeft}`;
    computerShipsLeftDisplay.innerHTML = `Computer Ships Left: ${computerTotalShipsLeft}`;
}

function resetShips(ships) {
    ships.forEach(ship => {
        ship.positions = new Set();
        ship.hitPositions = new Set();
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

function placeTresor(tresor) {
    let isPlaced = false;
    let occupiedPositions = new Set();

    // جمع مواقع السفن
    playerShips.forEach(ship => ship.positions.forEach(pos => occupiedPositions.add(pos)));
    computerShips.forEach(ship => ship.positions.forEach(pos => occupiedPositions.add(pos)));

    // تحديد إذا كان سيتم وضع الكنز أم لا
    const shouldPlace = Math.floor(Math.random() * 10) + 1; // رقم عشوائي بين 1 و 10

    if (shouldPlace !== 1 && shouldPlace !== 2) {
        tresor.position = null; // عدم وضع الكنز
        return;
    }

    while (!isPlaced) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        const position = `${row}-${col}`;

        if (!occupiedPositions.has(position)) {
            tresor.position = position;
            isPlaced = true;
        }
    }
}

function createGrid(gridElement, ships, isComputerGrid, tresor) {
    gridElement.style.display = 'grid';
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, minmax(25px, 1fr))`; // يجعل الخلايا مرنة
    gridElement.style.gap = '5px';
    gridElement.style.maxWidth = '90vw'; // يمنع الشبكة من التمدد أكثر من اللازم


    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.style.width = '100%';
            cell.style.aspectRatio = '1 / 1'; // يجعل المربعات مربعة دائماً
            cell.style.backgroundColor = 'lightgray';
            cell.style.cursor = 'pointer';
            cell.style.borderRadius = '5px';
            cell.dataset.position = `${row}-${col}`;


            if (!isComputerGrid) {
                ships.forEach(ship => {
                    if (ship.positions.has(cell.dataset.position)) {
                        cell.style.backgroundColor = 'darkgray';
                    }
                });
            }
            if (isComputerGrid) {
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
                cell.addEventListener('click', () => handlePlayerAttack(cell, ships, tresor));
            }
            gridElement.appendChild(cell);
        }
    }
}


function disablePlayerBoard() {
    document.querySelector('#player-grid').style.pointerEvents = 'none';
    document.querySelector('#player-grid').style.opacity = '0.5';
}

function enablePlayerBoard() {
    document.querySelector('#player-grid').style.pointerEvents = 'auto';
    document.querySelector('#player-grid').style.opacity = '1';
}

let attackQueue = [];
let lastHit = null;
let attackDirection = null;
let initialHit = null;

function computerTurn() {
    if (playerTotalShipsLeft === 0) return;

    disablePlayerBoard();

    let hitAgain = false; // لتعقب الضربات المتتالية

    let directions = {
        horizontal: [[0, 1], [0, -1]],
        vertical: [[1, 0], [-1, 0]]
    };

    function attackNext() {
        let availableCells = Array.from(document.querySelectorAll('#player-grid div'))
            .filter(cell => cell.style.backgroundColor === 'lightgray' || cell.style.backgroundColor === 'darkgray');
        if (availableCells.length === 0) {
            enablePlayerBoard(); // إذا لم يكن هناك خلايا متاحة، ينتهي الدور فورًا
            return;
        }

        let targetCell = attackQueue.length > 0 ? attackQueue.shift() : availableCells[Math.floor(Math.random() * availableCells.length)];
        if (!targetCell) {
            enablePlayerBoard();
            return;
        }

        let isShipHit = false;
        playerShips.forEach(ship => {
            if (ship.positions.has(targetCell.dataset.position)) {
                targetCell.style.backgroundColor = 'black';
                targetCell.innerHTML = '🔥';
                ship.hitPositions.add(targetCell.dataset.position);
                hitAgain = true;
                if (ship.hitPositions.size === ship.size) {
                    ship.positions.forEach(pos => {
                        let shipCell = document.querySelector(`#player-grid [data-position="${pos}"]`);
                        if (ship.hitPositions.has(pos)) {
                            shipCell.innerHTML = '🚢'; // ✅ وضع السفينة فقط على الأماكن المصابة
                        }
                        shipCell.style.backgroundColor = ship.color;
                    });
                    playerTotalShipsLeft--;
                    lastHit = null;
                    initialHit = null;
                    attackQueue = [];
                    attackDirection = null;
                    updateDisplays();
                } else {
                    let [r, c] = targetCell.dataset.position.split('-').map(Number);
                    if (!initialHit) initialHit = targetCell.dataset.position;
                    if (lastHit) {
                        let [lastR, lastC] = lastHit.split('-').map(Number);
                        attackDirection = (r === lastR) ? 'horizontal' : 'vertical';
                    }
                    lastHit = targetCell.dataset.position;
                    attackQueue = [];

                    let validDirections = attackDirection ? directions[attackDirection] : [...directions.horizontal, ...directions.vertical];
                    validDirections.forEach(([dr, dc]) => {
                        let newPos = `${r + dr}-${c + dc}`;
                        let newCell = document.querySelector(`#player-grid [data-position="${newPos}"]`);
                        if (newCell && (newCell.style.backgroundColor === 'lightgray' || newCell.style.backgroundColor === 'darkgray')) {
                            attackQueue.push(newCell);
                        }
                    });
                }
                isShipHit = true;
            }
        });

        if (!isShipHit) {
            targetCell.style.backgroundColor = 'blue';
            hitAgain = false;
        }

        if (playerTotalShipsLeft === 0) {
            setTimeout(() => {
                alert('❌ Computer Wins!');
                sendScoreToDatabase(-50, 1, 0, 0, "vsComputer");
                enablePlayerBoard();
            }, 500);
            return;
        }

        if (hitAgain || attackQueue.length > 0) {
            attackNext(); // استمر في الهجوم
        } else {
            enablePlayerBoard(); // انتهاء الدور
        }
    }

    attackNext();
}


function disableComputerBoard() {
    document.querySelector('#computer-grid').style.pointerEvents = 'none';
    document.querySelector('#computer-grid').style.opacity = '0.5';
}

function enableComputerBoard() {
    document.querySelector('#computer-grid').style.pointerEvents = 'auto';
    document.querySelector('#computer-grid').style.opacity = '1';
}

function handlePlayerAttack(cell, ships, tresor) {
    if (cell.style.backgroundColor !== 'yellow') return;

    disableComputerBoard(); // تعطيل الكمبيوتر أثناء دور اللاعب

    let isShipHit = false;

    // ✅ تحقق أولًا: هل الخلية تحتوي على الكنز؟
    if (tresor && cell.dataset.position === tresor.position) {
        cell.style.backgroundColor = 'gold';
        cell.innerHTML = '<img src="images/treasure-chest.png" width="24" height="24">';
        sendScoreToDatabase(25, 0, 0, 1);
        let treasureModal = new bootstrap.Modal(document.getElementById('treasureModal'));
        treasureModal.show();
        tresor.position = null; // تعطيل الكنز بعد العثور عليه
        enableComputerBoard(); // تمكين الكمبيوتر بعد انتهاء الهجوم
        return; // 🛑 إيقاف التنفيذ هنا لمنع أي تغييرات أخرى
    }

    // 🔍 البحث عن السفن وضربها
    ships.forEach(ship => {
        if (ship.positions.has(cell.dataset.position)) {
            cell.style.backgroundColor = 'black';
            cell.innerHTML = '🔥';
            ship.hitPositions.add(cell.dataset.position);

            if (ship.hitPositions.size === ship.size) {
                ship.positions.forEach(pos => {
                    let shipCell = document.querySelector(`#computer-grid [data-position="${pos}"]`);
                    shipCell.style.backgroundColor = ship.color;
                    shipCell.innerHTML = '🚢';
                });
                computerTotalShipsLeft--;
                updateDisplays();
            }
            isShipHit = true;
        }
    });

    // ✅ لا تغيّر لون الكنز إلى الأزرق
    if (!isShipHit) {
        cell.style.backgroundColor = 'blue';
        setTimeout(() => {
            enableComputerBoard();
            computerTurn();
        }, 500);
    } else {
        enableComputerBoard();
    }

    updateDisplays();
    if (computerTotalShipsLeft === 0) {
        alert('🎉 Player Wins!');
        sendScoreToDatabase(100, 1, 0, 0, "vsComputer");
        setTimeout(() => {
            enableComputerBoard();
            initializeGame();
        }, 1000);
    }
}




retryButton.addEventListener('click', initializeGame);
initializeGame();

function sendScoreToDatabase(score, wins, losses, tresor, matchType = null) {
    const data = {
        score,
        wins,
        losses,
        tresor
    };

    if (matchType) {
        data.match_type = matchType;
    }

    console.log("📤 Sending Data:", data); // ✅ تحقق مما يتم إرساله

    fetch('/update-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Server Response:", data);
        })
        .catch(error => console.error('❌ Fetch error:', error));
}








