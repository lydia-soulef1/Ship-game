const playerGrid = document.getElementById('player-grid');
const computerGrid = document.getElementById('computer-grid');
const retryButton = document.getElementById('retry');

const playerShipsLeftDisplay = document.getElementById('player-ships-left');
const computerShipsLeftDisplay = document.getElementById('computer-ships-left');

const shipSelection = document.getElementById("ship-selection");
const shipOptions = document.getElementById("ship-options");
const startGameButton = document.getElementById("start-game-button");
const flipButton = document.getElementById("flip-button");
const RandomButton = document.getElementById("random-btn");


const gridSize = 10;
const cellSize = 25;
const shipColors = ['red', 'orange', 'purple', 'brown', 'navy', 'green'];




const playerShips = [
    { size: 5, positions: new Set(), color: shipColors[0], hitPositions: new Set() },
    { size: 4, positions: new Set(), color: shipColors[1], hitPositions: new Set() },
    { size: 4, positions: new Set(), color: shipColors[2], hitPositions: new Set() },
    { size: 3, positions: new Set(), color: shipColors[3], hitPositions: new Set() },
    { size: 3, positions: new Set(), color: shipColors[4], hitPositions: new Set() },
    { size: 2, positions: new Set(), color: shipColors[5], hitPositions: new Set() }
];

setTimeout(() => {
    console.log(document.querySelectorAll(".ship").length); // يجب أن يكون أكبر من 0
}, 1000);

function initializeGame() {
    playerTotalShipsLeft = playerShips.length;
    computerTotalShipsLeft = computerShips.length;
    updateDisplays();
    playerGrid.innerHTML = '';
    computerGrid.innerHTML = '';
    RandomButton.textContent = "Random";
    resetShips(computerShips);
    placeShips(computerShips);
    placeTresor(tresor);
    createGrid(playerGrid, playerShips, false);
    createGrid(computerGrid, computerShips, true, tresor);
    RandomButton.textContent = "Random";
    generateShipSelection();
    document.getElementById("ship-selection").style.display = "block";
    document.getElementById("computer-section").style.display = "none";
    flipButton.disabled = true;
}

const computerShips = JSON.parse(JSON.stringify(playerShips));
let playerTotalShipsLeft = playerShips.length;
let computerTotalShipsLeft = computerShips.length;

let tresor = { position: null };

let selectedShip = null;
let originalColor = null;

// تعطيل زر "Flip" في البداية
flipButton.disabled = true;

document.addEventListener("click", (event) => {
    // التأكد من أن النقر ليس على سفينة
    if (selectedShip && !selectedShip.contains(event.target)) {
        selectedShip.childNodes.forEach(cell => {
            cell.style.backgroundColor = originalColor; // إرجاع اللون الأصلي
        });
        selectedShip = null;
        flipButton.disabled = true; // تعطيل زر التدوير عند إلغاء التحديد
    }
});

flipButton.addEventListener("click", () => {
    if (selectedShip) {
        const shipIndex = parseInt(selectedShip.dataset.shipIndex);
        const ship = playerShips[shipIndex];

        // عكس الاتجاه
        ship.isHorizontal = !ship.isHorizontal;
        selectedShip.dataset.isHorizontal = ship.isHorizontal; // تحديث الاتجاه في العنصر

        console.log(`🔄 تم تدوير السفينة ${shipIndex} إلى ${ship.isHorizontal ? "أفقي" : "عمودي"}`);

        // تحديث مظهر السفينة
        if (ship.isHorizontal) {
            selectedShip.style.gridTemplateColumns = `repeat(${ship.size}, 1fr)`;
            selectedShip.style.gridTemplateRows = "1fr";
        } else {
            selectedShip.style.gridTemplateColumns = "1fr";
            selectedShip.style.gridTemplateRows = `repeat(${ship.size}, 1fr)`;
        }
    }
});

document.getElementById("start-game-button").addEventListener("click", function () {
    document.getElementById("ship-selection").style.display = "none";
    document.getElementById("computer-section").style.display = "block";
    playerShips.forEach(ship => {
        ship.positions.forEach(position => {
            const cell = document.querySelector(`#player-grid div[data-position="${position}"]`);
            if (cell) {
                cell.style.backgroundColor = "darkgray";
            }
        });
    });

});

function updateDisplays() {
    playerShipsLeftDisplay.innerHTML = `Player Ships Left: ${playerTotalShipsLeft}`;
    computerShipsLeftDisplay.innerHTML = `Computer Ships Left: ${computerTotalShipsLeft}`;
}

function resetShips(ships) {
    ships.forEach(ship => {
        ship.positions = new Set();
        ship.hitPositions = new Set();

        document.querySelectorAll(".grid-cell").forEach(cell => {
            cell.classList.remove("occupied", "highlighted");
            cell.style.backgroundColor = ""; // إزالة أي لون متبقي
        });
        const shipOptions = document.getElementById("ship-options");
        shipOptions.innerHTML = '';
        generateShipSelection();
    });
}

RandomButton.addEventListener("click", () => {
    if (RandomButton.textContent === "Random") {
        document.querySelectorAll("#player-grid div").forEach(cell => {
            cell.style.backgroundColor = "lightgray"; // إعادة لون الشبكة للحالة الأصلية
        });

        // إعادة تعيين مواقع السفن
        resetShips(playerShips);
        placeShips(playerShips);

        // تحديث الشبكة بوضع السفن الجديدة
        playerShips.forEach((ship, index) => {
            ship.positions.forEach(position => {
                const cell = document.querySelector(`#player-grid div[data-position="${position}"]`);
                if (cell) {
                    cell.style.backgroundColor = ship.color; // استخدام اللون الخاص بكل سفينة
                }
            });

            // 🟢 إزالة السفينة من كارد الاختيار بعد وضعها في الشبكة
            const shipDiv = document.querySelector(`[data-ship-index="${index}"]`);
            if (shipDiv) {
                shipDiv.remove();
            }
        });
        RandomButton.textContent = "Reset"; // تحويله إلى زر Reset
    } else {
        resetShips(playerShips); // إرجاع السفن إلى منطقة الاختيار
        RandomButton.textContent = "Random"; // إعادته إلى زر Random
    }

});

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

function generateShipSelection() {
    const shipOptionsContainer = document.getElementById("ship-options");
    shipOptionsContainer.innerHTML = '';

    const gridCell = document.querySelector("#player-grid div");
    if (!gridCell) return;

    const gridGap = 5;
    const cellSize = gridCell.getBoundingClientRect().width;
    const totalWidth = (cellSize * 9) + (gridGap * 9);

    document.getElementById("ship-selection").style.maxWidth = `${totalWidth}px`;

    playerShips.forEach((ship, index) => {
        const shipDiv = document.createElement("div");
        shipDiv.classList.add("ship-option"); // تأكد من استخدام الفئة الصحيحة
        shipDiv.style.display = "grid";
        shipDiv.style.gridTemplateColumns = ship.isHorizontal ? `repeat(${ship.size}, ${cellSize}px)` : "1fr";
        shipDiv.style.gridTemplateRows = ship.isHorizontal ? "1fr" : `repeat(${ship.size}, ${cellSize}px)`;
        shipDiv.style.gap = `${gridGap}px`;
        shipDiv.style.cursor = "grab";
        shipDiv.style.maxWidth = `${totalWidth}px`;
        shipDiv.draggable = true;
        shipDiv.dataset.shipIndex = index.toString(); // ✅ تأكد من تعيين الفهرس الصحيح
        shipDiv.dataset.isHorizontal = (ship.isHorizontal !== undefined) ? ship.isHorizontal.toString() : "false";

        for (let i = 0; i < ship.size; i++) {
            const cell = document.createElement("div");
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.backgroundColor = ship.color;
            cell.style.borderRadius = "5px";
            shipDiv.appendChild(cell);
        }

        shipDiv.addEventListener("click", (event) => {
            event.stopPropagation();

            if (selectedShip) {
                selectedShip.childNodes.forEach(cell => {
                    cell.style.backgroundColor = originalColor;
                });
            }

            selectedShip = shipDiv;
            originalColor = ship.color;
            selectedShip.childNodes.forEach(cell => {
                cell.style.backgroundColor = "lightgray";
            });

            selectedShip.dataset.isHorizontal = ship.isHorizontal; // تحديث الاتجاه
            flipButton.disabled = false;
        });

        shipOptionsContainer.appendChild(shipDiv);
    });

    // ✅ قم بتعيين `shipIndex` بعد إضافة جميع السفن
    document.querySelectorAll(".ship-option").forEach((ship, index) => {
        ship.dataset.shipIndex = index; // تأكد من تعيين الفهرس لكل سفينة
        ship.draggable = true;

        ship.addEventListener("dragstart", (event) => {
            RandomButton.textContent = "Reset";
            ship.dataset.dragging = "true";
            const shipIndex = ship.dataset.shipIndex;
            const isHorizontal = ship.dataset.isHorizontal === "true"; // تحويل إلى Boolean
            event.dataTransfer.effectAllowed = "move";


            if (!shipIndex) {
                return;
            }

            event.dataTransfer.setData("shipIndex", index.toString());
            event.dataTransfer.setData("isHorizontal", event.target.dataset.isHorizontal);

            ship.classList.add("dragging");


            ship.addEventListener('dragend', () => {
                ship.classList.remove("dragging");
            });
        });
    });



}

setTimeout(generateShipSelection, 100);

function placeDraggedShip(shipIndex, row, col, isHorizontal) {
    const ship = playerShips[shipIndex];
    if (!ship) {
        console.error("❌ السفينة غير موجودة: index =", shipIndex);
        return;
    }
    ship.isHorizontal = true;
    let isPlaced = true;

    for (let i = 0; i < ship.size; i++) {
        const position = isHorizontal ? `${row}-${col + i}` : `${row + i}-${col}`;
        const cell = document.querySelector(`[data-position="${position}"]`);

        if (!cell || cell.style.backgroundColor !== 'lightgray') {
            console.warn("⚠️ لا يمكن وضع السفينة هنا، يوجد تداخل.");
            isPlaced = false;
            break;
        }
    }

    if (isPlaced) {
        ship.positions.forEach(position => {
            const cell = document.querySelector(`[data-position="${position}"]`);
            if (cell) {
                cell.style.backgroundColor = "lightgray";
                delete cell.dataset.shipIndex;
            }
        });
        ship.positions.clear();

        for (let i = 0; i < ship.size; i++) {
            const position = isHorizontal ? `${row}-${col + i}` : `${row + i}-${col}`;
            const cell = document.querySelector(`[data-position="${position}"]`);
            if (cell) {
                cell.style.backgroundColor = ship.color;
                ship.positions.add(position);
                cell.dataset.shipIndex = shipIndex;
            }
        }

        ship.isHorizontal = isHorizontal;
        console.log(`✅ تم وضع السفينة ${shipIndex} بـ ${isHorizontal ? "أفقي" : "عمودي"}`);

        // تحديث مظهر السفينة بعد وضعها
        const shipDiv = document.querySelector(`[data-ship-index="${shipIndex}"]`);
        if (shipDiv) {
            if (isHorizontal) {
                shipDiv.style.gridTemplateColumns = `repeat(${ship.size}, 1fr)`;
                shipDiv.style.gridTemplateRows = "1fr";
            } else {
                shipDiv.style.gridTemplateColumns = "1fr";
                shipDiv.style.gridTemplateRows = `repeat(${ship.size}, 1fr)`;
            }
        }
    }
}




function createGrid(gridElement, ships, isComputerGrid, tresor) {
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

            if (!isComputerGrid) {
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

                cell.addEventListener("dragleave", () => {
                    // clearHighlightedCells();
                });

                cell.addEventListener("drop", (event) => {
                    event.preventDefault();

                    const shipIndex = event.dataTransfer.getData("shipIndex");
                    const isHorizontal = event.dataTransfer.getData("isHorizontal") === "true";

                    if (!shipIndex) {
                        console.error("❌ لم يتم جلب shipIndex بشكل صحيح عند drop!", { shipIndex, event });
                        return;
                    }

                    const row = parseInt(cell.dataset.row, 10);
                    const col = parseInt(cell.dataset.col, 10);

                    console.log(`✅ تم إسقاط السفينة ${shipIndex} في (${cell.dataset.position})`);
                    placeDraggedShip(parseInt(shipIndex, 10), row, col, isHorizontal);

                    const shipDiv = document.querySelector(`[data-ship-index="${shipIndex}"]`);
                    if (shipDiv) {
                        shipDiv.remove();
                        console.log(`🚀 تم إزالة السفينة ${shipIndex} من الكارد`);
                        shipDiv.addEventListener("dragend", () => {
                            delete shipDiv.dataset.dragging;
                        });
                    }
                    clearHighlightedCells();
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



let attackQueue = [];
let lastHit = null;
let attackDirection = null;
let initialHit = null;

function computerTurn() {
    if (playerTotalShipsLeft === 0) return;

    
    let hitAgain = false; // لتعقب الضربات المتتالية

    let directions = {
        horizontal: [[0, 1], [0, -1]],
        vertical: [[1, 0], [-1, 0]]
    };

    function attackNext() {
        let availableCells = Array.from(document.querySelectorAll('#player-grid div'))
            .filter(cell => cell.style.backgroundColor === 'lightgray' || cell.style.backgroundColor === 'darkgray');
        if (availableCells.length === 0) {
             // إذا لم يكن هناك خلايا متاحة، ينتهي الدور فورًا
            return;
        }

        let targetCell = attackQueue.length > 0 ? attackQueue.shift() : availableCells[Math.floor(Math.random() * availableCells.length)];
        if (!targetCell) {
            
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
                
            }, 500);
            return;
        }

        if (hitAgain || attackQueue.length > 0) {
            attackNext(); // استمر في الهجوم
        } else {
             // انتهاء الدور
        }
    }

    attackNext();
}

function handlePlayerAttack(cell, ships, tresor) {
    if (cell.style.backgroundColor !== 'yellow') return;


    let isShipHit = false;


    if (tresor && cell.dataset.position === tresor.position) {
        cell.style.backgroundColor = 'gold';
        cell.innerHTML = '<img src="images/treasure-chest.png" width="24" height="24">';
        sendScoreToDatabase(25, 0, 0, 1);
        let treasureModal = new bootstrap.Modal(document.getElementById('treasureModal'));
        treasureModal.show();
        tresor.position = null;
        return; 
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
            
            computerTurn();
        }, 500);
    } else {
        
    }

    updateDisplays();
    if (computerTotalShipsLeft === 0) {
        alert('🎉 Player Wins!');
        sendScoreToDatabase(100, 1, 0, 0, "vsComputer");
        setTimeout(() => {
            
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