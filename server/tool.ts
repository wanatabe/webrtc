import { v4 as uuidV4 } from 'uuid'

//取得32位大写UUID字符串
export function uuid(): string {
  return uuidV4().replace(/-/gi, '').toUpperCase()
}
