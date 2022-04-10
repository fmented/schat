import type {Chat, Profile, BaseChat} from './database'
import type {SubscribtionSchemaType} from 'model'

interface ProfileUpdate{
    content: string
    receiver: string[]
}

interface MessageUpdate{
    id: string,
    receiver: string
}

export interface MessageReceived extends MessageUpdate{}
export interface MessageSeen extends MessageUpdate{}

export interface BioUpdate extends ProfileUpdate{}
export interface AvatarUpdate extends ProfileUpdate{}

export interface Sync{
    deviceId: string,
    chat: Chat[],
    profile: Profile[]
}

export interface Login {
    username:string,
    password:string
}

export type Logout={
    deviceId:string
}

export interface SignUp extends Login{
    email: string
}

export type Detail = Omit<Login, 'password'> 

export type FetchMap = {
    '/api/message/seen/': MessageSeen
    '/api/message/received/': MessageReceived
    '/api/message/send/': BaseChat
    '/api/updateProfile/bio/': BioUpdate
    '/api/updateProfile/avatar/': AvatarUpdate
    '/api/message/sync/': {
        profile: Profile[],
        chat: Chat[],
        deviceId: string
    },
    '/api/auth/detail/': Detail,
    '/api/auth/find/': Detail,
    '/api/auth/login/': Login,
    '/api/auth/logout/': Logout,
    '/api/auth/subscribe/': SubscribtionSchemaType
}
