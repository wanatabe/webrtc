"use strict";
exports.__esModule = true;
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var url = require("url");
var tool_1 = require("./tool");
var port = 8089;
var httpServer = (0, http_1.createServer)();
var user = new Map();
var io = new socket_io_1.Server(httpServer, {
    /* options */
    path: 'connection'
});
io.on('connection', function (socket) {
    // ...
    console.log('socket :>> ', socket);
});
httpServer.on('request', function (req, res) {
    var _a;
    if (!req.url)
        return res.end('ok!');
    var param = url.parse(req.url);
    console.log('param :>> ', param);
    if ((_a = param.pathname) === null || _a === void 0 ? void 0 : _a.includes('login')) {
        var id = (0, tool_1.uuid)();
        user.set(id, null);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, token: id }));
    }
});
httpServer.listen(port, function () {
    console.log("\u670D\u52A1\u5DF2\u542F\u52A8\uFF1A http://localhost:".concat(port, " "));
});
