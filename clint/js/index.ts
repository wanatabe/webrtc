import { io, Socket } from 'socket.io-client'
import '../css/index.css'
import axios from 'axios'
import { MsgType } from './type'

function createVideo(stream: MediaStream, selectors: string) {
  const video = document.createElement('video')
  video.srcObject = stream

  video.onloadeddata = () => {
    console.log('开始播放 ')
    video.play()
  }

  if (selectors.includes('caller')) {
    video.className = 'local'
  } else {
    video.className = 'remote'
  }
  // 为移动端添加控制条
  if (navigator.userAgent.toUpperCase().includes('ANDROID')) {
    video.controls = true
  }

  const videoBox = document.querySelector<HTMLElement>(selectors)
  if (!videoBox) return
  videoBox.appendChild(video)
}

/**
 * 解决移动端无法自动播放问题
 * error： play() can only be initiated by a user gesture.
 */
document.addEventListener('click', () => {
  const videoList = document.getElementsByTagName('video')
  for (const video of videoList) {
    video.play()
  }
})

const baseUrl = `${location.protocol}//${location.hostname}:8089`

let logged: string | undefined = undefined
let peers = new Map()
let socket: Socket
let localStream: MediaStream | undefined = undefined
const mediaConstraints = {
  video: true,
  audio: true
}

window.onload = async () => {
  const {
    data: { token }
  } = await axios.post(baseUrl + '/login')
  logged = token

  socket = io(baseUrl, { extraHeaders: { token } })

  socket.on('connect', () => {
    console.log('open :>> 消息服务已连接')
  })
  socket.on('disConnect', (msg) => {
    console.log('close :>> 消息服务连接断开', msg)
  })
  socket.on('connect_error', (err) => {
    console.log('err :>> ', err)
  })
  socket.on('message', async (msg, data) => {
    console.log('来自服务端的消息 ', msg)
    console.log('data:>>>>>', data)
    switch (msg) {
      case 'join':
        await startLive(data)
        break
      case 'leave':
        hangUpCall(data)
        break
      case 'hangUp':
        hangUpCall(data)
        break
      case 'offer':
        await reciveOffer(data)
        break
      case 'answer':
        reciveAnswer(data)
        break
      case 'candidate':
        await reciveCandidate(data)
        break
      default:
        break
    }
  })
}

async function reciveOffer(data: MsgType) {
  console.log('收到发送方 SDP')

  console.log('创建接收方对等连接')
  const peer = await createPeerConnection(data)

  console.log('创建成功', peers)
  if (!peer) throw new Error('RTCPeerConnection还未创建')

  console.log('设置发送方SDP为远程描述')
  const desc = new RTCSessionDescription(data.sdp)
  await peer.setRemoteDescription(desc)

  console.log('创建接收方 SDP')
  const answer = await peer.createAnswer()
  peer.setLocalDescription(answer)
  const remote: MsgType = {
    code: 'answer',
    id: logged,
    target: data.id,
    sdp: answer
  }
  console.log('发送接收方 SDP')
  sendMsg(remote)

  if (candidateList.size > 0) {
    const list: Map<any, any> = candidateList.get(data.id)
    for (const key of list.keys()) {
      reciveCandidate(list.get(key))
    }
    candidateList.delete(data.id)
  }
}

function reciveAnswer(data: MsgType) {
  console.log('收到接受SDP')
  const peer: RTCPeerConnection = peers.get(data.id)
  const desc = new RTCSessionDescription(data.sdp)
  peer.setRemoteDescription(desc)
}

const candidateList = new Map()
async function reciveCandidate(data: MsgType) {
  console.log('收到候选', data.candidate)
  console.log('收到候选', peers)
  const peer: RTCPeerConnection = peers.get(data.id)
  if (!peer) {
    let list: Map<any, any> = candidateList.get(data.id)
    if (!list) list = new Map()
    list.set(list.size + 1, data)
    candidateList.set(data.id, list)
  } else {
    await peer.addIceCandidate(data.candidate)
  }
}

/**
 * 消息发送
 * @param {MsgType} msg
 * @returns void
 */
function sendMsg(msg: MsgType): void {
  let { code, id } = msg
  if (!code) throw new Error('消息发送失败： code为undefined')

  if (!id) msg.id = logged

  socket.send(code, msg)
}

/**
 * 创建RTCPeerConnection
 * @param data
 * @returns
 */
async function createPeerConnection(data: MsgType): Promise<RTCPeerConnection | undefined> {
  const { id } = data
  if (!id) return
  localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
  createVideo(localStream, 'div.caller')

  const peer = new RTCPeerConnection()
  // 记录对等连接
  peers.set(id, peer)

  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(id)
  // 监听候选
  peer.onicecandidate = (event) => handleICECandidateEvent(event, id)
  // 监听流
  peer.ontrack = handleTrackEvent
  // 监听连接状态
  peer.oniceconnectionstatechange = () => handleICEConnectionStateChangeEvent(id)
  // 监听信令状态
  peer.onsignalingstatechange = () => handleSignalingStateChangeEvent(id)

  if (!localStream) throw new Error('localStream不存在')
  addTrack(localStream, peer)
  return peer
}

/**
 * 开始音视频
 * @param data
 */
async function startLive(data: MsgType) {
  const peer = await createPeerConnection(data)
  if (!peer) throw new Error('RTCPeerConnection还未创建')
}

/**
 * 处理ICE Candidate
 * @param event
 * @param id
 */
function handleICECandidateEvent(event: RTCPeerConnectionIceEvent, id: string) {
  if (event.candidate) {
    const remote: MsgType = { code: 'candidate', id: logged, target: id, candidate: event.candidate }
    sendMsg(remote)
  }
}

/**
 * 处理流改变事件
 * @param event
 * @returns
 */
function handleTrackEvent(event: RTCTrackEvent) {
  const remote = document.querySelector<HTMLVideoElement>('video.remote')
  console.log('remote :>> ')
  if (!remote) {
    createVideo(event.streams[0], 'div.called')
  } else {
    const stream = remote.srcObject as MediaStream
    const remoteStream = event.streams[0]
    remoteStream.getTracks().forEach((track) => stream.addTrack(track))
    remote.srcObject = stream
  }
}

/**
 * 监听RTCPeerConnection连接状态
 * @param id
 */
function handleICEConnectionStateChangeEvent(id: string) {
  const peer = peers.get(id)
  switch (peer.iceConnectionState) {
    case 'closed':
    case 'failed':
    case 'disconnected':
      closeVideoCall(id)
      break
  }
}
/**
 * 监听RTCPeerConnection信号状态
 * 如果信号状态变为 closed，关闭呼叫。
 * @param id
 */
function handleSignalingStateChangeEvent(id: string) {
  const peer = peers.get(id)
  switch (peer.signalingState) {
    case 'closed':
      closeVideoCall(id)
      break
  }
}

/**
 * 添加流轨
 * @param stream
 * @param peer
 */
function addTrack(stream: MediaStream, peer: RTCPeerConnection) {
  for (const track of stream.getTracks()) {
    console.log('track------------------ :>> ', track)
    peer.addTrack(track, stream)
  }
}

/**
 * 1、创建offer
 * 2、设置本地描述
 * @param id
 */
async function handleNegotiationNeededEvent(id: string) {
  try {
    const peer = peers.get(id)
    if (!peer) throw new Error('RTCPeerConnection还未创建')

    // 创建offer
    const offer = await peer.createOffer()

    // 将Offer设置为本地描述
    peer.setLocalDescription(offer)
    // 通过信令服务发送offer
    const remote: MsgType = { code: 'offer', id: logged, target: id, sdp: offer }
    sendMsg(remote)
  } catch (error) {
    console.error(error)
  }
}

/**
 * 挂断
 * @returns
 */
function hangUpCall(data: MsgType) {
  if (!logged || !data.id) return
  closeVideoCall(data.id)
  const remote: MsgType = {
    code: 'hangUp',
    id: logged
  }
  sendMsg(remote)
}

function closeVideoCall(id: string) {
  if (!id) throw new Error('id不存在')

  var remoteVideo = document.querySelector<HTMLVideoElement>('video.remote')
  var localVideo = document.querySelector<HTMLVideoElement>('video.local')

  const peer = peers.get(id)

  if (peer) {
    peer.ontrack = null
    peer.onremovetrack = null
    peer.onremovestream = null
    peer.onicecandidate = null
    peer.oniceconnectionstatechange = null
    peer.onsignalingstatechange = null
    peer.onicegatheringstatechange = null
    peer.onnegotiationneeded = null

    if (remoteVideo && remoteVideo.srcObject) {
      ;(remoteVideo.srcObject as MediaStream).getTracks().forEach((track) => track.stop())
    }

    if (localVideo && localVideo.srcObject) {
      ;(localVideo.srcObject as MediaStream).getTracks().forEach((track) => track.stop())
    }

    peer.close()
    peers.delete(id)
  }

  if (remoteVideo) {
    remoteVideo.removeAttribute('src')
    remoteVideo.removeAttribute('srcObject')
    remoteVideo.remove()
  }
  if (localVideo) {
    localVideo.removeAttribute('src')
    localVideo.removeAttribute('srcObject')
    localVideo.remove()
  }
  localStream = undefined
}
