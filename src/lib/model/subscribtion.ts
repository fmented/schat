import mongoose from 'mongoose'

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
    username: {
        required: true,
        type: String
    },
    deviceId:{
        type: String,
        required: true
    }

})

export type SubType = {
    endpoint:string,
    keys: SubKeyType
    expirationTime?: string|null,
    username:string,
    deviceId:string
}

type SubKeyType = {
    p256dh: string,
    auth:string
}


export default SubSchema

