import type {PushSubscription} from 'web-push'

type ProfileUpdate = {
    content: string
    receiver: string[]
}

type MessageUpdate = {
    id: string,
    receiver: string
}

export type MessageReceived = MessageUpdate
export type MessageSeen = MessageUpdate

export type BioUpdate = ProfileUpdate
export type AvatarUpdate = ProfileUpdate

export type Sync = {
    deviceId: string,
    chat: Chat[],
    profile: Profile[]
}

export type Login = {
    username:string,
    password:string
}

export type Logout={
    deviceId:string
}

export type SignUp = Login & {
    email: string
}

export type Detail = Omit<Login, 'password'> 

export type BaseChat = {
    from:string,
    to:string,
    content:string
    timeStamp: number;
    id: string
}

export type Chat = BaseChat & {
    status: 'sent'|'received'|'seen'|'pending'|'sending'
}


export type Profile = {
    username: BaseChat['from'] | BaseChat['to'],
    bio: string,
    avatar: string
}


export type RawChat = Omit<Chat, 'id'|'timeStamp'|'status'>

export type PushEventMap = {
    message_seen: {id:string}
    message_received: {id:string}
    message_new: BaseChat
    bio_update: {bio:string, username:string}
    avatar_update: {avatar:string, username:string}
    sync: {
        profile: Profile[],
        chat: Chat[],
        deviceId: string
    }
}


export type PostMessageEventMap = {
    after_login: PushSubscription & {username:string}
    profile_update: Profile
    subscribed:string,
    open:string
    update: string
    before_logout: string,
    unsubscribed: undefined
}

export type SWEventMap = PostMessageEventMap & PushEventMap

export const enum API_URL {
    MESSAGE_SEEN = '/api/message/seen',
    MESSAGE_SEND = '/api/message/send',
    MESSAGE_RECEIVED = '/api/message/received',
    MESSAGE_SYNC = '/api/message/sync',
    AUTH_LOGIN = '/api/auth/login',
    AUTH_LOGOUT = '/api/auth/logout',
    AUTH_SIGNUP = '/api/auth/signup',
    AUTH_DETAIL = '/api/auth/detail',
    AUTH_FIND = '/api/auth/find',
    AUTH_SUBSCRIBE = '/api/auth/subscribe',
    UPDATE_BIO = '/api/update/bio',
    UPDATE_AVATAR = '/api/update/avatar',
}

export type FetchMap = {
    [API_URL.MESSAGE_SEEN]: MessageSeen
    [API_URL.MESSAGE_RECEIVED]: MessageReceived
    [API_URL.MESSAGE_SEND]: BaseChat
    [API_URL.UPDATE_BIO]: BioUpdate
    [API_URL.UPDATE_AVATAR]: AvatarUpdate
    [API_URL.MESSAGE_SYNC]: {
        profile: Profile[],
        chat: Chat[],
        deviceId: string
    },
    [API_URL.AUTH_DETAIL]: Detail,
    [API_URL.AUTH_FIND] : Detail,
    [API_URL.AUTH_LOGIN]: Login,
    [API_URL.AUTH_LOGOUT]: Logout,
    [API_URL.AUTH_SIGNUP]: SignUp,
    [API_URL.AUTH_SUBSCRIBE]: PushSubscription & {username:string, deviceId:string}
}
