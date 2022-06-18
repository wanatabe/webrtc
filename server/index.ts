import { createServer } from 'http'
import { Server } from 'socket.io'
import * as url from 'url'
import { getIPv4, getOtherId, uuid } from './tool'

const IPv4 = getIPv4()
const port = 8089
const user = new Map()

// 创建http服务
const httpServer = createServer((req, res) => {
  res.setHeader('access-control-allow-origin', '*')
})

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
  console.log(`服务已启动： http://localhost:${port}\n http://${IPv4}:${port} `)
})

// 创建websocket服务
const io = new Server(httpServer, {
  cors: {
    origin: new RegExp(`http://${IPv4}:\\d+`),
    credentials: true
  }
})

io.on('connection', (socket) => {
  // 连接时触发
  /** 获取token，客户端为设置token时断开连接 */
  const token = socket.handshake.headers.token as string
  if (!token) return socket.disconnect()
  /** 记录用户及连接 */
  const isLogin = typeof user.get(token)
  if (isLogin === 'boolean') {
    user.set(token, socket)
  }

  socket.on('message', (code, data) => {
    reciveMsg(code, data, token)
  })

  socket.on('disconnect', () => {
    console.log('连接断开：', token)
    socket.removeAllListeners()
    socket.disconnect()

    user.delete(token)
    io.to(getOtherId(token, user)).emit('message', 'leave', { code: 'leave', sender: token })
  })
})

function reciveMsg(code: string, data: any, token: string) {
  console.log('来自客户端的code：', code)
  console.log('来自客户端的data：', data)
  switch (code) {
    case 'offer':
      break
    case 'answer':
      break
    case 'candence':
      break
    case 'leave':
      break

    default:
      break
  }
}
