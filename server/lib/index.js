"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = require("https");
const socket_io_1 = require("socket.io");
const url = __importStar(require("url"));
const tool_1 = require("./tool");
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const IPv4 = (0, tool_1.getIPv4)();
const port = 8089;
const user = new Map();
// 创建http服务
const httpServer = (0, https_1.createServer)({
    key: fs.readFileSync(path_1.default.join(__dirname, '../../sslKey/test.key')),
    cert: fs.readFileSync(path_1.default.join(__dirname, '../../sslKey/test.crt'))
}, (req, res) => {
    res.setHeader('access-control-allow-origin', '*');
});
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
    console.log(`服务已启动： https://localhost:${port}\n https://${IPv4}:${port} `);
});
// 创建websocket服务
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: new RegExp(`https://${IPv4}:\\d+`),
        credentials: true
    }
});
io.on('connection', (socket) => {
    // 连接时触发
    /** 获取token，客户端为设置token时断开连接 */
    const token = socket.handshake.headers.token;
    if (!token || !user.get(token))
        return socket.disconnect();
    /** 记录用户及连接 */
    console.log('连接成功：', token);
    user.set(token, socket.id);
    sendMsg({ code: 'join', id: token });
    socket.on('message', (code, data) => {
        reciveMsg(code, data, token);
    });
    socket.on('disconnect', () => {
        console.log('连接断开：', token);
        socket.removeAllListeners();
        socket.disconnect();
        user.delete(token);
        sendMsg({ code: 'leave', id: token });
    });
});
function sendMsg(data) {
    const { code, id, target } = data;
    let sendTo = undefined;
    if (target) {
        sendTo = (0, tool_1.getTargetId)(user, target);
    }
    else {
        sendTo = (0, tool_1.getOtherId)(user, id);
    }
    console.log('sendTo :>> ', sendTo);
    if (!sendTo || sendTo.length === 0)
        return;
    io.to(sendTo).emit('message', code, data);
}
function reciveMsg(code, data, token) {
    console.log('来自客户端的code：', code);
    switch (code) {
        case 'offer':
        case 'answer':
        case 'candidate':
        case 'hungUp':
            sendMsg(data);
            break;
        default:
            break;
    }
}
