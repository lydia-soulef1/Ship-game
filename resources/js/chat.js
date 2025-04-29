// chat.js

export const initializeChat = (socket, gameId, playerNumber) => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');

    // Function is INSIDE, has access to chatBox and playerNumber
    function appendMessageToChatBox(sender, message) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message');

        if (sender == playerNumber) {
            msgDiv.classList.add('my-message');
            msgDiv.innerHTML = `<strong>You:</strong> ${message}`;
        } else {
            msgDiv.classList.add('opponent-message');
            msgDiv.innerHTML = `<strong>Opponent:</strong> ${message}`;
        }

        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        console.log("Sending message:", { gameId, playerNumber, message });
        
        socket.emit('chat_message', {
            room_id: gameId,
            sender: playerNumber,
            message: message
        });

        appendMessageToChatBox(playerNumber, message);
        chatInput.value = '';
    });

    socket.on('chat_message', ({ sender, message }) => {
        appendMessageToChatBox(sender, message);
    });

    socket.on('chat_history', (messages) => {
        messages.forEach(({ sender, message }) => {
            appendMessageToChatBox(sender, message);
        });
    });
};


export function appendMessageToChatBox(sender, message, playerNumber, chatBox) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message');

    if (sender == playerNumber) {
        msgDiv.classList.add('my-message');
        msgDiv.innerHTML = `<strong></strong> ${message}`;
    } else {
        msgDiv.classList.add('opponent-message');
        msgDiv.innerHTML = `<strong>Opponent:</strong> ${message}`;
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

