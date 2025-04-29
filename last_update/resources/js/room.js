import { io } from 'socket.io-client';
import { initializeChat, appendMessageToChatBox } from './chat.js';

const chatBox = document.getElementById('chat-box');

const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
localStorage.setItem('sessionId', sessionId);


const getSocketUrl = () => {
    if (window.location.origin.includes('127.0.0.1')) {
        return 'http://127.0.0.1:3000';
    }
    return 'http://localhost:3000';
};

const socket = io(getSocketUrl(), {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    extraHeaders: {
        "X-Requested-With": "XMLHttpRequest"
    }
});

// ✅ عند الاتصال الأول أو بعد إعادة الاتصال
socket.on('connect', () => {
    socket.emit('register_session', { sessionId });
    console.log('✅ Connected as:', socket.id);
    document.getElementById('connection-status').textContent =
        '✅ Connected';

    // 👇 نحاول إعادة الانضمام للمباراة إذا كان اللاعب في منتصف مباراة
    const matchId = new URLSearchParams(window.location.search).get("match");
    if (matchId) {
        socket.emit("join_match", matchId, (response) => {
            if (response.success) {
                console.log("🔁 Rejoined match:", matchId);
            } else {
                console.warn("⚠️ Failed to rejoin match");
            }
        });
    }
    const storedMessages = JSON.parse(localStorage.getItem('chatHistory')) || [];
    storedMessages.forEach(messageData => {
        socket.emit('chat_message', { room_id: gameId, sender: messageData.sender, message: messageData.message });
    });
});
socket.on('chat_message', (data) => {
    // عرض الرسالة في واجهة المستخدم
    appendMessageToChatBox(data.sender, data.message, data.sender, chatBox);

    // تخزين الرسالة في localStorage
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.push({ sender: data.sender, message: data.message });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
});
socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
    document.getElementById('connection-status').textContent =
        '⚠️ Connection failed. Trying to reconnect...';
});

socket.on('disconnect', (reason) => {
    console.warn('🔌 Disconnected:', reason);
    document.getElementById('connection-status').textContent =
        '🔌 Disconnected. Trying to reconnect...';
});

// ✅ استلام رسالة بأن الخصم غادر
socket.on('opponent_left', () => {
    alert("🚨 الخصم غادر المباراة.");
    // بإمكانك إعادة التوجيه أو إنهاء الجلسة
});



document.addEventListener('DOMContentLoaded', () => {


    let myTurn = false;

    // UI Elements
    const findMatchBtn = document.getElementById('find-match');
    const statusDisplay = document.getElementById('game-status');
    const gameContainer = document.querySelector('.game-container');
    const playerGrid = document.getElementById('player-grid');
    const opponentGrid = document.getElementById('opponent-grid');


    let gameId = localStorage.getItem('gameId');
    let playerNumber = localStorage.getItem('playerNumber');

    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');



    if (gameId && playerNumber) {
        console.log("🧩 Rejoining room:", gameId);
        socket.emit('join_match', gameId);
    }
    // Prevent page reload when sending message
    if (chatForm) {
        chatForm.addEventListener('submit', (event) => {
            event.preventDefault();  // Prevent the form from reloading the page
            // عند إرسال الرسالة
            const message = chatInput.value.trim();
            if (message) {
                console.log("Sending message:", { gameId, playerNumber, message });

                // تخزين الرسالة في localStorage
                let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
                chatHistory.push({ sender: playerNumber, message: message });
                localStorage.setItem('chatHistory', JSON.stringify(chatHistory));



                // إرسال الرسالة عبر السوكيت
                socket.emit('chat_message', { room_id: gameId, sender: playerNumber, message: message });
                appendMessageToChatBox(data.sender, data.message, playerNumber, chatBox);
                
                chatInput.value = ''; // Clear input after sending
            }

        });
    }


    if (playerGrid && opponentGrid) {
        initializeBoards(playerGrid, opponentGrid);
    }

    // Matchmaking
    findMatchBtn.addEventListener('click', () => {
        socket.emit('join_queue');
        statusDisplay.textContent = 'Searching for opponent...';
        findMatchBtn.disabled = true;

        // Game Events
        socket.on('game_start', (data) => {

            if (data) {
                gameId = data.matchId;
                playerNumber = data.playerNumber;
                console.log("✅ Match started, player number:", playerNumber);

                // Emit join_match event to the server
                socket.emit('join_match', gameId);

                // Store data locally
                localStorage.setItem('gameId', data.matchId);
                localStorage.setItem('playerNumber', data.playerNumber);
                localStorage.setItem('opponentSocketId', data.opponentSocketId);

                // Delay the redirect a bit to avoid interruption
                setTimeout(() => {
                    window.location.href = data.redirectTo;
                }, 100); // 100ms is usually enough
            } else {
                console.error("Received empty data in game_start event.");
            }
            initializeChat(socket, gameId, playerNumber);
        });



        socket.on('begin_game', (data) => {
            myTurn = data.yourTurn;
            statusDisplay.textContent = myTurn ? 'Your turn!' : 'Opponent\'s turn...';
            if (myTurn) opponentGrid.classList.add('active-turn');
        });

        socket.on('attack_result', (data) => {
            updateAttackResult(data.coordinate, data.result);
            if (!data.yourTurn) opponentGrid.classList.remove('active-turn');
        });

        socket.on('opponent_attack', (data) => {
            updateDefenseGrid(data.coordinate, data.isHit);
            if (data.sunkShip) showSunkShip(data.sunkShip);
        });

        socket.on('game_over', (data) => {
            statusDisplay.textContent = data.winner ? 'You won!' : 'You lost!';
            opponentGrid.classList.remove('active-turn');
        });
    });
    // Game Functions
    function initializeBoards() {
        createGrid(playerGrid, true);
        createGrid(opponentGrid, false);
        placeShipsAutomatically();
        console.log('Boards initialized!');
    }


    function createGrid(gridElement, isPlayerGrid) {
        gridElement.style.display = 'grid';
        gridElement.style.gridTemplateColumns = 'repeat(10, 1fr)';
        gridElement.style.gap = '2px';

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
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


                if (!isPlayerGrid) {
                    cell.addEventListener('click', () => handlePlayerAttack(cell));
                }

                gridElement.appendChild(cell);
            }
        }
    }

    function placeShipsAutomatically() {
        const ships = {
            carrier: ['0,0', '0,1', '0,2', '0,3', '0,4'],
            battleship: ['2,0', '2,1', '2,2', '2,3'],
            cruiser: ['4,0', '4,1', '4,2'],
            submarine: ['6,0', '6,1', '6,2'],
            destroyer: ['8,0', '8,1']
        };

        Object.values(ships).flat().forEach(coord => {
            const [row, col] = coord.split(',');
            const cell = playerGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('ship');
        });

        socket.emit('place_ships', { gameId, ships });
    }

    function handlePlayerAttack(cell) {
        if (!myTurn || cell.classList.contains('hit') || cell.classList.contains('miss')) return;

        const coordinate = cell.dataset.position;

        // إرسال الهجوم إلى السيرفر
        socket.emit('attack', {
            matchId: gameId,
            coordinate: coordinate
        });

        // إنهاء الدور المحلي حتى يأتي الرد من السيرفر
        myTurn = false;
        opponentGrid.classList.remove('active-turn');
    }
    socket.on('attack_result', (data) => {
        const [row, col] = data.coordinate.split(',');
        const cell = opponentGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        if (data.result === 'hit') {
            cell.classList.add('hit');
            cell.innerHTML = '🔥';
        } else {
            cell.classList.add('miss');
            cell.innerHTML = '💧';
        }

        if (data.sunkShip) {
            // إظهار اسم السفينة أو تلوينها بالكامل
            console.log(`You sunk opponent's ${data.sunkShip}`);
        }

        // إذا انتهت اللعبة
        if (data.gameOver) {
            statusDisplay.textContent = data.winner === playerNumber ? '🎉 You won!' : '😢 You lost.';
            opponentGrid.classList.remove('active-turn');
        } else {
            statusDisplay.textContent = 'Opponent\'s turn...';
        }
    });
    socket.on('opponent_attack', (data) => {
        const [row, col] = data.coordinate.split(',');
        const cell = playerGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        if (data.isHit) {
            cell.classList.add('hit');
            cell.innerHTML = '🔥';
        } else {
            cell.classList.add('miss');
            cell.innerHTML = '💧';
        }

        if (data.sunkShip) {
            // إظهار رسالة غرق السفينة
            console.log(`Opponent sunk your ${data.sunkShip}`);
        }

        // تحديث الحالة
        myTurn = true;
        statusDisplay.textContent = 'Your turn!';
        opponentGrid.classList.add('active-turn');
    });


    function updateAttackResult(coordinate, result) {
        const [row, col] = coordinate.split(',');
        const cell = opponentGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add(result);
    }

    function updateDefenseGrid(coordinate, isHit) {
        const [row, col] = coordinate.split(',');
        const cell = playerGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add(isHit ? 'hit' : 'miss');
    }

    function showSunkShip(shipName) {
        console.log(`${shipName} sunk!`);
    }

});
