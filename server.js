const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8000 });

wss.on("connection", (ws) => {
    console.log("✅ عميل متصل!");

    ws.on("message", (message) => {
        console.log("📩 رسالة مستلمة:", message);
        ws.send("📤 تم استقبال رسالتك!");
    });

    ws.on("close", () => {
        console.log("❌ عميل قطع الاتصال");
    });
});

console.log("🚀 WebSocket يعمل على ws://127.0.0.1:8000/");
