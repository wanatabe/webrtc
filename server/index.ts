import { createServer } from 'https'
import { Server } from 'socket.io'
import * as url from 'url'
import { getIPv4, getOtherId, getTargetId, uuid } from './tool'
import * as fs from 'fs'
import path from 'path'
import { MsgType } from '../clint/js/type'

const IPv4 = getIPv4()
const port = 8089
const user = new Map()

// 创建http服务
const httpServer = createServer(
  {
    key: fs.readFileSync(path.join(__dirname, '../../sslKey/test.key')),
    cert: fs.readFileSync(path.join(__dirname, '../../sslKey/test.crt'))
  },
  (req, res) => {
    res.setHeader('access-control-allow-origin', '*')
  }
)

httpServer.on('request', function (req, res) {
  if (!req.url || req.url === '/') return res.end('ok!')
  const param = url.parse(req.url)
  if (param.pathname?.includes('login')) {
    const id = uuid()
    user.set(id, true)
    res.statusCode = 200
    res.end(JSON.stringify({ success: true, token: id }))
  }
})

httpServer.listen(port, () => {
  console.log(`服务已启动： https://localhost:${port}\n https://${IPv4}:${port} `)
})

// 创建websocket服务
const io = new Server(httpServer, {
  cors: {
    origin: new RegExp(`https://${IPv4}:\\d+`),
    credentials: true
  }
})

io.on('connection', (socket) => {
  // 连接时触发
  /** 获取token，客户端为设置token时断开连接 */
  const token = socket.handshake.headers.token as string
  if (!token || !user.get(token)) return socket.disconnect()
  /** 记录用户及连接 */

  console.log('连接成功：', token)
  user.set(token, socket.id)
  sendMsg({ code: 'join', id: token })

  socket.on('message', (code, data) => {
    reciveMsg(code, data, token)
  })

  socket.on('disconnect', () => {
    console.log('连接断开：', token)
    socket.removeAllListeners()
    socket.disconnect()

    user.delete(token)
    sendMsg({ code: 'leave', id: token })
  })
})

function sendMsg(data: MsgType) {
  const { code, id, target } = data

  let sendTo = undefined
  if (target) {
    sendTo = getTargetId(user, target)
  } else {
    sendTo = getOtherId(user, id)
  }
  console.log('sendTo :>> ', sendTo)
  if (!sendTo || sendTo.length === 0) return
  io.to(sendTo).emit('message', code, data)
}

function reciveMsg(code: string, data: any, token: string) {
  console.log('来自客户端的code：', code)
  switch (code) {
    case 'offer':
    case 'answer':
    case 'candidate':
    case 'hungUp':
      sendMsg(data)
      break

    default:
      break
  }
}
