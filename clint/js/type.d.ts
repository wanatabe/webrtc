export interface MsgType extends BaseType {
  /** 消息类型 */
  code: string
  /** 消息发送目标，未设置时全体发送 */
  target?: string | string[]
  /** 发送人 */
  id?: string
}
export interface BaseType {
  [key: string]: any
}
