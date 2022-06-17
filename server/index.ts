import { createServer } from 'http'
import { Server } from 'socket.io'
import * as url from 'url'
import { uuid } from './tool'

const port = 8089
const httpServer = createServer()

const user = new Map()

const io = new Server(httpServer, {
  cors: {
    origin: /http:\/\/localhost:\d+/,
    credentials: true
  }
})

io.on('connection', (socket) => {
  // ...
  console.log('socket :>> ', socket)
})

httpServer.on('request', function (req, res) {
  if (!req.url || req.url === '/') return res.end('ok!')
  const param = url.parse(req.url)
  console.log('param :>> ', param)
  if (param.pathname?.includes('login')) {
    const id = uuid()
    user.set(id, null)
    res.statusCode = 200
    res.end(JSON.stringify({ success: true, token: id }))
  }
})

httpServer.listen(port, () => {
  console.log(`服务已启动： http://localhost:${port} `)
})
