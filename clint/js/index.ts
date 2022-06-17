import { io } from 'socket.io-client'
import '../css/index.css'

const socket = io('http://localhost:8089')
console.log('socket :>> ', socket)

const a = 45
