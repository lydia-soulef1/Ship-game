
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
let isPlayerTurn = true; // يبدأ اللاعب أولاً


const playerShips = [
    { size: 5, positions: new Set(), color: shipColors[0], hitPositions: new Set() },
    { size: 4, positions: new Set(), color: shipColors[1], hitPositions: new Set() },
    { size: 3, positions: new Set(), color: shipColors[2], hitPositions: new Set() },
    { size: 2, positions: new Set(), color: shipColors[3], hitPositions: new Set() }
];

let playerTotalShipsLeft = playerShips.length;
let opponentTotalShipsLeft = playerShips.length;


function initializeGame(playerGrid, opponentGrid, playerShipsLeftDisplay, opponentShipsLeftDisplay) {
    if (!playerGrid || !opponentGrid || !playerShipsLeftDisplay || !opponentShipsLeftDisplay) {
        console.error("❌ عنصر واحد أو أكثر غير موجود في DOM. تحقق من الـ HTML.");
        return;
    }

    playerGrid.innerHTML = '';
    opponentGrid.innerHTML = '';
    resetShips(playerShips);
    placeShips(playerShips);
    createGrid(playerGrid, playerShips, false);
    createGrid(opponentGrid, [], true);
    updateDisplays(playerShipsLeftDisplay, opponentShipsLeftDisplay);
    setupWebSocket();
}


function updateDisplays() {
    const playerShipsLeftDisplay = document.getElementById('player-ships-left');
    const opponentShipsLeftDisplay = document.getElementById('opponent-ships-left');

    if (!playerShipsLeftDisplay || !opponentShipsLeftDisplay) {
        console.error("❌ خطأ: أحد عناصر التحديث غير موجود في DOM.");
        return;
    }

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

            if (!isOpponentGrid) {
                // ✅ عرض السفن في شبكة اللاعب
                ships.forEach(ship => {
                    if (ship.positions.has(cell.dataset.position)) {
                        cell.style.backgroundColor = 'darkgray';
                    }
                });
            } else {
                // ✅ وضع السفن في شبكة الخصم دون إظهارها
                ships.forEach(ship => {
                    if (ship.positions.has(cell.dataset.position)) {
                        cell.dataset.hasShip = "true"; // تخزين المعلومة بدون إظهارها
                    }
                });

                // ✅ تفاعل مع الخلية عند تحريك الفأرة
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

                // ✅ عند النقر، يتم فحص ما إذا كانت هناك سفينة أم لا
                cell.addEventListener('click', () => {
                    handlePlayerAttack(cell, playerShips);
                });
            }

            gridElement.appendChild(cell);
        }
    }
}


function setupWebSocket() {
    let socket = new WebSocket("ws://127.0.0.1:8000/");

    socket.onopen = () => {
        console.log("✅ متصل بـ WebSocket!");
    };

    socket.onerror = (error) => {
        console.error("❌ خطأ في WebSocket:", error);
    };

    socket.onmessage = (event) => {
        console.log("📩 رسالة من السيرفر:", event.data);
    };

    return socket;
}

document.addEventListener("DOMContentLoaded", function () {
    socket = setupWebSocket();
});



document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname === "/") { // الصفحة الرئيسية (welcome)
        setupRoomButtons();
    } else if (window.location.pathname === "/playOnline") { // صفحة اللعبة
        setupGame();
    }
});

function setupRoomButtons() {
    let createRoomButton = document.getElementById("createRoom");
    let joinRoomButton = document.getElementById("joinRoom");

    if (createRoomButton) {
        createRoomButton.addEventListener("click", () => {
            fetch('/create-room', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.roomCode) {
                        localStorage.setItem("roomCode", data.roomCode);
                        alert(`✅ Room Created! Code: ${data.roomCode}`);
                        window.location.href = `/playOnline?room=${data.roomCode}`; // الانتقال إلى صفحة اللعبة
                    } else {
                        alert("❌ Failed to create room.");
                    }
                });
        });
    } else {
        console.error("❌ عنصر 'Create Room' غير موجود في DOM.");
    }

    if (joinRoomButton) {
        joinRoomButton.addEventListener("click", () => {
            let roomCode = document.getElementById("roomCode").value.trim();
            if (!roomCode) {
                alert("⚠️ Please enter a valid room code.");
                return;
            }

            fetch('/join-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomCode: roomCode })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem("roomCode", roomCode);
                        alert(`🎉 Joined Room: ${roomCode}`);
                        window.location.href = `/playOnline?room=${roomCode}`; // الانتقال إلى صفحة اللعبة
                    } else {
                        alert("❌ Room not found or full.");
                    }
                });
        });
    } else {
        console.error("❌ عنصر 'joinRoom' غير موجود في DOM.");
    }
}

function setupGame() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get("room");

    if (roomCode) {
        document.getElementById("room-code").innerText = roomCode;
    } else {
        console.error("❌ لا يوجد كود غرفة في URL.");
    }
}


document.addEventListener("DOMContentLoaded", function () {
    // جلب كود الغرفة من الـ URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get("room");

    // عرض الكود إذا كان موجودًا
    if (roomCode) {
        document.getElementById("room-code").innerText = roomCode;
    } else {
        console.error("❌ لا يوجد كود غرفة في URL.");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const roomCodeElement = document.getElementById("room-code");
    const copyButton = document.getElementById("copy-room-code");

    if (copyButton) {
        copyButton.addEventListener("click", function () {
            const roomCode = roomCodeElement.innerText.trim();
            if (roomCode !== "----") {
                navigator.clipboard.writeText(roomCode)
                    .then(() => {
                        alert("✅ Room code copied: " + roomCode);
                    })
                    .catch(err => console.error("❌ Copy failed:", err));
            } else {
                alert("⚠️ No room code available to copy.");
            }
        });
    }
});



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

function checkGameOver() {
    if (opponentTotalShipsLeft === 0) {
        setTimeout(() => {
            alert("🎉 تهانينا! لقد فزت باللعبة! 🏆");
            disableGame(); // تعطيل الشبكة بعد الفوز
        }, 100);
    } else if (playerTotalShipsLeft === 0) {
        setTimeout(() => {
            alert("😞 خسرت! حاول مجددًا.");
            disableGame(); // تعطيل الشبكة بعد الخسارة
        }, 100);
    }
}

function setPlayerGridState(enabled) {
    const grid = document.getElementById("opponent-grid");
    if (grid) {
        grid.style.pointerEvents = enabled ? "auto" : "none"; // تعطيل أو تفعيل التفاعل مع الشبكة
        grid.style.opacity = enabled ? "1" : "0.5"; // تقليل الوضوح عند التعطيل
    }
}


function handlePlayerAttack(cell) {
    if (!isPlayerTurn) {
        console.warn("⏳ ليس دورك! انتظر دور الخصم.");
        return;
    }

    if (cell.style.backgroundColor !== 'yellow') return;

    let isShipHit = false;
    playerShips.forEach(ship => {
        if (ship.positions.has(cell.dataset.position)) {
            cell.style.backgroundColor = 'black'; // ✅ تغيير لون الخلية إلى أسود عند الإصابة
            ship.hitPositions.add(cell.dataset.position);

            if (ship.hitPositions.size === ship.size) {
                // 🚀 تغيير لون السفينة بعد غرقها
                ship.positions.forEach(pos => {
                    const opponentCell = document.querySelector(`#opponent-grid [data-position="${pos}"]`);
                    if (opponentCell) {
                        opponentCell.style.backgroundColor = ship.color;
                    }
                });
                opponentTotalShipsLeft--;
                updateDisplays();
            }
            isShipHit = true;
        }
    });

    if (!isShipHit) {
        // ⏳ إذا لم تصب أي سفينة، يصبح اللون أزرق
        cell.style.backgroundColor = 'blue';

        // ⏳ إذا لم يصب، ينتقل الدور للخصم بعد ثانية
        isPlayerTurn = false;
        setPlayerGridState(false);
        setTimeout(opponentTurn, 1000);
    } else {
        // 🔥 إذا أصاب، يبقى الدور له
        console.log("🎯 أصبت سفينة! يمكنك اللعب مرة أخرى.");
    }

    checkGameOver();
}








function opponentTurn() {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error("❌ WebSocket غير متصل، لا يمكن تنفيذ هجوم الخصم.");
        return;
    }

    console.log("📡 إرسال طلب هجوم الخصم إلى السيرفر...");
    socket.send(JSON.stringify({ type: "opponent_attack" })); // إرسال طلب الهجوم إلى السيرفر
}

function handleOpponentAttack(position) {
    const cell = document.querySelector(`#player-grid [data-position='${position}']`);
    if (!cell) return;

    let isShipHit = false;
    playerShips.forEach(ship => {
        if (ship.positions.has(position)) {
            cell.style.backgroundColor = 'black';
            ship.hitPositions.add(position);

            if (ship.hitPositions.size === ship.size) {
                // 🚀 تغيير لون السفينة بعد غرقها
                ship.positions.forEach(pos => {
                    const playerCell = document.querySelector(`#player-grid [data-position="${pos}"]`);
                    if (playerCell) {
                        playerCell.style.backgroundColor = ship.color;
                    }
                });
                playerTotalShipsLeft--;
                updateDisplays();
            }
            isShipHit = true;
        }
    });

    checkGameOver();

    if (!isShipHit) {
        // 🎯 إذا لم يصب، يعود الدور للاعب
        isPlayerTurn = true;
        setPlayerGridState(true);
    } else {
        // 🔥 إذا أصاب، يبقى دوره
        console.log("💥 الخصم أصاب سفينة! يمكنه اللعب مجددًا.");
        setTimeout(opponentTurn, 1000);
    }
}

