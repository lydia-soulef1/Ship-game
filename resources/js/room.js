import { io } from 'socket.io-client';
import { initializeChat, appendMessageToChatBox } from './chat.js';
import { initializeBoards, handlePlayerAttack, updateAttackResult, placeShips } from './online.js'; // استيراد الوظائف الجديدة


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
        placeShips(playerGrid);
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
            placeShips(playerGrid);
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
    
   });
