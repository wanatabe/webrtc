"use strict";
exports.__esModule = true;
exports.uuid = void 0;
var uuid_1 = require("uuid");
//取得32位大写UUID字符串
function uuid() {
    return (0, uuid_1.v4)().replace(/-/gi, '').toUpperCase();
}
exports.uuid = uuid;
