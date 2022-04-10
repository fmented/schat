import mongoose from "mongoose";
import type {Connection, Model} from 'mongoose'
import {USERNAME, PASSWORD, CLUSTER_URL, DB_NAME} from '$lib/secrets'
import type {UserSchemaType} from './user'
import type {SubType as SubscribtionSchemaType} from './subscribtion'
import UserSchema from "./user";
import SubscribtionSchema from "./subscribtion";

const uri = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER_URL}/${DB_NAME}?retryWrites=true&w=majority`;

let conn:Connection

export async function open() {   
    if(!conn) {
        conn = await mongoose.createConnection(encodeURI(uri)).asPromise()
        const User = conn.model<UserSchemaType>('User', UserSchema)
        const Subscribtion = conn.model<SubscribtionSchemaType>('Subscribtion', SubscribtionSchema)
        return {User, Subscribtion}
    }

    return {
        User: conn.model<UserSchemaType>('User'),
        Subscribtion : conn.model<SubscribtionSchemaType>('Subscribtion')
    }
}

export async function close(){
    return
}

export {ImagePlaceholder} from './user';

export type {
    UserSchemaType,
    SubscribtionSchemaType
}