import { v4 as uuidV4 } from 'uuid'
import * as os from 'os'

//取得32位大写UUID字符串
function uuid(): string {
  return uuidV4().replace(/-/gi, '').toUpperCase()
}

/**
 * 获取IPv4
 * @returns
 */
function getIPv4() {
  let ifaces = os.networkInterfaces()

  for (let dev in ifaces) {
    let iface = ifaces[dev]
    if (!iface) continue

    for (let i = 0; i < iface.length; i++) {
      let { family, address, internal } = iface[i]

      if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
        return address
      }
    }
  }
}

function getUserId(user: Map<string, any>): string[] {
  const userId = []
  for (const key of user.keys()) {
    userId.push(user.get(key))
  }
  return userId
}
function getOtherId(user: Map<string, any>, me?: string | string[]): string[] {
  if (!me) return getUserId(user)
  console.log('user :>> ', user)
  const userId = []
  for (const key of user.keys()) {
    if (typeof me === 'string' && me !== key) {
      userId.push(user.get(key))
    }
    if (Array.isArray(me)) {
      for (let index = 0; index < me.length; index++) {
        const item = me[index]
        if (item !== key) userId.push(user.get(key))
      }
    }
  }
  return userId
}

function getTargetId(user: Map<string, any>, target?: string | string[]): string[] {
  if (!target) return getUserId(user)
  const userId = []
  for (const key of user.keys()) {
    if (typeof target === 'string' && target === key) {
      userId.push(user.get(key))
    }
    if (Array.isArray(target)) {
      for (let index = 0; index < target.length; index++) {
        const item = target[index]
        if (item === key) userId.push(user.get(key))
      }
    }
  }
  return userId
}

export { uuid, getIPv4, getUserId, getOtherId, getTargetId }
