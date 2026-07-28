const WebSocket = require('ws');

// Thay token và nội dung RPC của bạn vào đây
const TOKEN = "NHẬP_TOKEN_DISCORD_CỦA_BẠN_VÀO_ĐÂY"; 

const rpcData = {
    op: 3,
    d: {
        since: Date.now(),
        activities: [{
            name: "Sony Software",
            type: 2, // Loại 2 tương ứng với "Listening to" (Đang nghe)
            details: "discord.gg/808",
            state: "SONY SONY SONY",
            timestamps: {
                start: Math.floor(Date.now() / 1000)
            },
            assets: {
                large_image: "mp_external_link_hoac_id" // ID hình ảnh trên Discord Developer (nếu có)
            }
        }],
        status: "online",
        afk: false
    }
};

function connectRPC() {
    console.log("Đang kết nối tới Discord...");
    const ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');

    ws.on('open', function open() {
        console.log("Đã kết nối WebSocket thành công!");
    });

    ws.on('message', function incoming(data) {
        const packet = JSON.parse(data);
        
        // Khi Discord yêu cầu xác thực (Hello - Opcode 10), gửi Token đăng nhập
        if (packet.op === 10) {
            const heartbeatInterval = packet.d.heartbeat_interval;

            // Gửi gói tin định danh tài khoản
            ws.send(JSON.stringify({
                op: 2,
                d: {
                    token: TOKEN,
                    properties: {
                        os: "Windows",
                        browser: "Chrome",
                        device: ""
                    }
                }
            }));

            // Duy trì nhịp đập (Heartbeat) để không bị ngắt kết nối
            setInterval(() => {
                ws.send(JSON.stringify({ op: 1, d: null }));
            }, heartbeatInterval);

            // Gửi trạng thái RPC sau khi đăng nhập thành công 3 giây
            setTimeout(() => {
                ws.send(JSON.stringify(rpcData));
                console.log("Đã cập nhật trạng thái RPC lên Discord!");
            }, 3000);
        }
    });

    ws.on('close', function(code, reason) {
        console.log(`Mất kết nối (Mã: ${code}). Đang kết nối lại sau 5 giây...`);
        setTimeout(connectRPC, 5000); // Tự động kết nối lại nếu bị rớt mạng
    });

    ws.on('error', function(error) {
        console.log("Lỗi kết nối WebSocket:", error.message);
    });
}

connectRPC();
