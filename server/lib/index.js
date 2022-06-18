"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const url = require("url");
const tool_1 = require("./tool");
const IPv4 = (0, tool_1.getIPv4)();
const port = 8089;
const httpServer = (0, http_1.createServer)((req, res) => {
    res.setHeader('access-control-allow-origin', '*');
});
const user = new Map();
httpServer.on('request', function (req, res) {
    if (!req.url || req.url === '/')
        return res.end('ok!');
    const param = url.parse(req.url);
    if (param.pathname?.includes('login')) {
        const id = (0, tool_1.uuid)();
        user.set(id, true);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, token: id }));
    }
});
httpServer.listen(port, () => {
    console.log(`服务已启动： http://localhost:${port}\n http://${IPv4}:${port} `);
});
console.log('reg :>> ', new RegExp(`http://${IPv4}:\\d+`));
const io = new socket_io_1.Server(httpServer, {
    cors: {
        // origin: /http:\/\/:\d+/,
        origin: new RegExp(`http://${IPv4}:\\d+`),
        credentials: true
    }
});
io.on('connection', (socket) => {
    // 连接时触发
    /** 获取token，客户端为设置token时断开连接 */
    const token = socket.handshake.headers.token;
    if (!token)
        return socket.disconnect();
    /** 记录用户及连接 */
    const isLogin = typeof user.get(token);
    if (isLogin === 'boolean') {
        user.set(token, socket);
    }
    socket.on('message', (code, data) => {
        reciveMsg(code, data, token);
    });
    socket.on('disconnect', () => {
        console.log('连接断开：', token);
        socket.removeAllListeners();
        socket.disconnect();
        user.delete(token);
        io.to((0, tool_1.getOtherId)(token, user)).emit('message', 'leave', { code: 'leave', sender: token });
    });
});
function reciveMsg(code, data, token) {
    console.log('来自客户端的code：', code);
    console.log('来自客户端的data：', data);
    switch (code) {
        case 'offer':
            break;
        case 'answer':
            break;
        case 'candence':
            break;
        case 'leave':
            break;
        default:
            break;
    }
}
