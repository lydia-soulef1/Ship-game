const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const sessionMap = new Map();

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:8000", "http://127.0.0.1:8000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Game state
const waitingPlayers = [];
const activeMatches = new Map();
const gameChatHistory = {}; // تخزين تاريخ الدردشة لكل غرفة



io.on('connection', (socket) => {
    socket.on('register_session', ({ sessionId }) => {
        const old = sessionMap.get(sessionId);

        if (old) {
            if (old.disconnectTimeout) {
                clearTimeout(old.disconnectTimeout); // ألغِ انتظار الفصل
                old.disconnectTimeout = null;
            }

            // استبدال socketId القديم بالجديد
            old.socketId = socket.id;

            // إعادة الانضمام للغرفة
            if (old.matchId) {
                socket.join(old.matchId);
                console.log(`🔁 Session ${sessionId} reconnected to match ${old.matchId}`);

                // إرسال رسالة للخصم أن اللاعب عاد
                socket.to(old.matchId).emit('opponent_reconnected');
            }
        } else {
            // تسجيل جديد للجلسة
            sessionMap.set(sessionId, {
                socketId: socket.id,
                matchId: null,
                playerNumber: null,
                disconnectTimeout: null
            });
        }
    });

    socket.on('join_queue', (data) => {
        console.log('Player added to queue:', socket.id);

        // function calculateWinRate(player) {
        //     if (player.totalGames === 0) return 0;
        //     return (player.wins / player.totalGames) * 100;
        // }

        // function findMatchBasedOnWinRate(newPlayerId) {
        //     const newPlayer = playersStats[newPlayerId];
        //     const newWinRate = calculateWinRate(newPlayer);

        //     for (const [otherId, otherPlayer] of Object.entries(queue)) {
        //         if (otherId === newPlayerId) continue;

        //         const otherWinRate = calculateWinRate(otherPlayer);
        //         const diff = Math.abs(newWinRate - otherWinRate);

        //         if (diff <= 5) { // ✅ فرق 5% يعتبر مناسب
        //             return otherId;
        //         }
        //     }

        //     return null;
        // }

        // Rest of your existing queue logic...
        waitingPlayers.push({
            socketId: socket.id,
            joinedAt: Date.now()
        });


        // Clean up stale players (>30 seconds in queue)
        const now = Date.now();
        while (waitingPlayers.length > 0 && now - waitingPlayers[0].joinedAt > 30000) {
            waitingPlayers.shift();
        }

        // Match players in pairs
        if (waitingPlayers.length >= 2) {
            // const newPlayer = waitingPlayers[waitingPlayers.length - 1]; // اللاعب الأحدث
            // const newPlayerId = newPlayer.socketId;

            // const matchCandidateIndex = waitingPlayers.findIndex(p => {
            //     if (p.socketId === newPlayerId) return false;

            //     const diff = Math.abs(
            //         calculateWinRate(playersStats[newPlayerId]) -
            //         calculateWinRate(playersStats[p.socketId])
            //     );
            //     return diff <= 5;
            // });

            // if (matchCandidateIndex !== -1) {
            //     const matchedPlayer = waitingPlayers.splice(matchCandidateIndex, 1)[0];
            const player1 = waitingPlayers.shift();
            const player2 = waitingPlayers.shift();

            const matchId = `match_${Date.now()}`;


            // Store match info using socketId instead of userId
            activeMatches.set(matchId, {
                players: {
                    [player1.socketId]: {
                        number: 1,
                    },
                    [player2.socketId]: {
                        number: 2,
                    }
                },
                createdAt: Date.now()
            });

            // Notify player 1 with redirect URL
            io.to(player1.socketId).emit('game_start', {
                matchId,
                playerNumber: 1,
                opponentSocketId: player2.socketId, // Using socketId instead of userId
                redirectTo: `/playOnline?match=${matchId}&player=1`
            });

            // Notify player 2 with redirect URL
            io.to(player2.socketId).emit('game_start', {
                matchId,
                playerNumber: 2,
                opponentSocketId: player1.socketId, // Using socketId instead of userId
                redirectTo: `/playOnline?match=${matchId}&player=2`
            });

            console.log(`🎮 Created match ${matchId} between ${player1.socketId} and ${player2.socketId}`);
            // }
        }
    });

    socket.on('join_match', (matchId, callback) => {
        socket.join(matchId);
        console.log(`🧩 Socket ${socket.id} joined room ${matchId}`);

        if (callback && typeof callback === 'function') {
            callback({ success: true });
        }
    });




    socket.on('chat_message', (data) => {
        const { room_id, sender, message } = data;
        console.log("✅ Received message on server:", data);

        // بث الرسالة لكل اللاعبين في الغرفة
        io.to(room_id).emit('chat_message', {
            sender: data.sender,
            message: data.message
        });

        // حفظ الرسالة في التاريخ
        if (!gameChatHistory[room_id]) {
            gameChatHistory[room_id] = [];
        }
        gameChatHistory[room_id].push({ sender, message });
    });



    socket.on('get_chat_history', (gameId) => {
        const chatHistory = gameChatHistory[gameId] || [];
        socket.emit('chat_history', chatHistory);
    });
    socket.on('connect_error', (error) => {
        console.error("حدث خطأ في الاتصال:", error);
    });


    socket.on('disconnect', (reason) => {
        console.log(`⚠️ Socket ${socket.id} disconnected (${reason})`);
    
        for (const [sessionId, session] of sessionMap.entries()) {
            if (session.socketId === socket.id) {
                session.disconnectTimeout = setTimeout(() => {
                    // لم يرجع بعد المهلة
                    if (session.matchId) {
                        io.to(session.matchId).emit('opponent_left');
                        activeMatches.delete(session.matchId);
                    }
                    sessionMap.delete(sessionId);
                    console.log(`❌ Session ${sessionId} permanently disconnected`);
                }, 5000); // أو المدة التي تريدها
                break;
            }
        }
    });
    

});

server.listen(3000, () => {
    console.log('Matchmaking server running on port 3000');
});