import type {SubscribtionSchemaType} from 'model'


type MessageUpdate = {
    id: string,
    receiver: string
}

export type MessageReceived = MessageUpdate
export type MessageSeen = {receiver:string, id:string[]}

export type Sync = {
    deviceId: string,
    chat: Message[],
}

export type Detail = {deviceId:string}

export type BaseMessage = {
    from:string,
    to:string,
    content:string
    timeStamp: number;
    id: string
}

export type Message = BaseMessage & {
    status: 'sent'|'received'|'seen'|'pending'|'sending'
}

export type Conversation = {
    with:string,
    thumbnail:string,
    chat: Message[],
    alias: string
}

export type RawMessage = Omit<Message, 'id'|'timeStamp'|'status'>

export type PushEventMap = {
    message_seen: {id:string[], deviceId:string}
    message_received: {id:string, deviceId:string}
    message_new: BaseMessage & {alias:string, thumbnail:string}
    message_sync: {
        chat: Conversation[],
        deviceId: string
    }
}


export type PostMessageEventMap = {
    open:string
    update: string,
    before_unsubscribe: undefined
}

export type SWEventMap = PostMessageEventMap & PushEventMap

export const enum API_URL {
    MESSAGE_SEEN = '/api/message/seen',
    MESSAGE_SEND = '/api/message/send',
    MESSAGE_RECEIVED = '/api/message/received',
    MESSAGE_SYNC = '/api/message/sync',
    AUTH_DETAIL = '/api/auth/detail',
    AUTH_FIND = '/api/auth/find',
    AUTH_SUBSCRIBE = '/api/auth/subscribe',
    AUTH_UNSUBSCRIBE = '/api/auth/unsubscribe',
    UPDATE_PROFILE = '/api/update/profile',
}

type Receiver = {receiver:string}

export type FetchMap = {
    [API_URL.MESSAGE_SEEN]: MessageSeen
    [API_URL.MESSAGE_RECEIVED]: MessageReceived
    [API_URL.MESSAGE_SEND]: BaseMessage
    [API_URL.MESSAGE_SYNC]: PushEventMap['message_sync'] & Receiver,
    [API_URL.AUTH_DETAIL]: Detail,
    [API_URL.AUTH_FIND] : Detail,
    [API_URL.AUTH_SUBSCRIBE]: SubscribtionSchemaType
    [API_URL.AUTH_UNSUBSCRIBE]: undefined
    [API_URL.UPDATE_PROFILE]: {nickname:string, bio:string, avatar:string}
}
