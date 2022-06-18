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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOtherId = exports.getUserId = exports.getIPv4 = exports.uuid = void 0;
const uuid_1 = require("uuid");
const os = __importStar(require("os"));
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
