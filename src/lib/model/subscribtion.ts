import mongoose from 'mongoose'
import {v4} from 'uuid' 
import {randAva} from 'utils'

const SubSchema = new mongoose.Schema<SubType>({
    endpoint: {
        type:String,
        required: true
    },
    expirationTime: {
        type: String||null
    },
    keys:{
        auth: {
            type: String,
            required: true
        },
        p256dh: {
            type: String,
            required: true
        }
    },
    nickname: {
        required: true,
        type: String
    },
    deviceId:{
        type: String,
        required: true,
        default: v4
    },
    bio:{
        type: String,
        default: ()=>'Hi there!'
    },
    avatar:{
        type: String,
        default: randAva
    }


})

export type SubType = {
    endpoint:string,
    keys: SubKeyType
    expirationTime?: string|null,
    nickname:string,
    deviceId:string,
    bio?:string,
    avatar?:string,
}

type SubKeyType = {
    p256dh: string,
    auth:string
}


export default SubSchema

