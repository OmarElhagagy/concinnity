import { PUBLIC_BACKEND_URL } from '$env/static/public'

export enum RoomType {
  None = '',
  LocalFile = 'local_file',
  RemoteFile = 'remote_file',
}

export interface ChatMessage {
  userId: string
  message: string
  timestamp: string
}

export interface RoomInfo {
  id: string
  createdAt?: string
  // TODO: API doesn't return this over the WebSocket, we might as well not use it, but not ideal
  // modifiedAt?: string
  type: RoomType
  target: string
}

export interface PlayerState {
  paused: boolean
  speed: number
  timestamp: number
  lastAction: string
}

export const initialPlayerState: PlayerState = {
  paused: true,
  timestamp: 0,
  speed: 1,
  lastAction: new Date(0).toISOString(),
}

interface Handlers {
  onClose: (this: WebSocket, ev: CloseEvent) => void
  onError: (this: WebSocket, ev: Event) => void
  onMessage: (this: WebSocket, ev: MessageEvent) => void
}

export function connect(id: string, handlers: Handlers, reconnect = false): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(
      `${PUBLIC_BACKEND_URL.replace('http', 'ws')}/api/room/${id}/join`,
      'v0',
    )

    ws.onopen = () => {
      console.log('Connecting to room')
      // Send login message
      ws.send(JSON.stringify({ token: localStorage.getItem('concinnity:token'), reconnect }))
    }

    ws.onmessage = event => {
      console.log('Connected to room')
      // Set new handlers
      ws.onclose = handlers.onClose.bind(ws)
      ws.onerror = handlers.onError.bind(ws)
      ws.onmessage = handlers.onMessage.bind(ws)
      // Handle current event
      ws.onmessage(event)
      // Resolve WebSocket
      resolve(ws)
    }

    ws.onclose = event => {
      reject(new Error('WebSocket closed abruptly! ' + event.reason || `Code: ${event.code}`))
    }
  })
}

export enum MessageType {
  Chat = 'chat',
  RoomInfo = 'room_info',
  PlayerState = 'player_state',
  Pong = 'pong',
}

export interface GenericMessage {
  type: MessageType
}

export interface IncomingChatMessage extends GenericMessage {
  type: MessageType.Chat
  data: ChatMessage[]
}

export interface IncomingPlayerStateMessage extends GenericMessage {
  type: MessageType.PlayerState
  data: PlayerState
}

export interface IncomingRoomInfoMessage extends GenericMessage {
  type: MessageType.RoomInfo
  data: RoomInfo
}

export const isIncomingChatMessage = (message: GenericMessage): message is IncomingChatMessage =>
  message.type === MessageType.Chat && Array.isArray((message as IncomingChatMessage).data)

export const isIncomingPlayerStateMessage = (
  message: GenericMessage,
): message is IncomingPlayerStateMessage => message.type === MessageType.PlayerState

export const isIncomingRoomInfoMessage = (
  message: GenericMessage,
): message is IncomingRoomInfoMessage => message.type === MessageType.RoomInfo
