"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOtherId = exports.getUserId = exports.getIPv4 = exports.uuid = void 0;
const uuid_1 = require("uuid");
const os = require("os");
//取得32位大写UUID字符串
function uuid() {
    return (0, uuid_1.v4)().replace(/-/gi, '').toUpperCase();
}
exports.uuid = uuid;
/**
 * 获取IPv4
 * @returns
 */
function getIPv4() {
    let ifaces = os.networkInterfaces();
    for (let dev in ifaces) {
        let iface = ifaces[dev];
        if (!iface)
            continue;
        for (let i = 0; i < iface.length; i++) {
            let { family, address, internal } = iface[i];
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
                return address;
            }
        }
    }
}
exports.getIPv4 = getIPv4;
function getUserId(user) {
    const userId = [];
    for (const key of user.keys()) {
        userId.push(key);
    }
    return userId;
}
exports.getUserId = getUserId;
function getOtherId(me, user) {
    const userId = [];
    for (const key of user.keys()) {
        if (typeof me === 'string' && me !== key) {
            userId.push(key);
        }
        if (Array.isArray(me)) {
            for (let index = 0; index < me.length; index++) {
                const item = me[index];
                if (item !== key)
                    userId.push(key);
            }
        }
    }
    return userId;
}
exports.getOtherId = getOtherId;
