import type {Chat, BaseChat, Profile} from './database'
import type {PushSubscription} from 'web-push'

type RawChat = Omit<Chat, 'id'|'timeStamp'|'status'>

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

export type SubscribtionWithAuth = PushSubscription & {username:string}

export type PostMessageEventMap = {
    message_send:RawChat
    message_delete: {id:Chat['id']}
    clear_chat: Chat['from'] | Chat['to']
    before_logout: undefined
    after_login: PushSubscription & {username:string}
    chat_update: {chat:Chat[], isNew:boolean}
    chatlist_update: (Chat& {img:string})[]
    profile_update: Profile
    profilelist_update: Profile[]
    request_profilelist: undefined
    request_profile: string 
    request_chat: string
    request_chatlist: undefined
    read: {
        receiver: string
    }
    post_bio:string
    post_avatar:string
}

export type SWEventMap = PostMessageEventMap & PushEventMap