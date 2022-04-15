import mongoose from "mongoose";
import type {Connection} from 'mongoose'
import {USERNAME, PASSWORD, CLUSTER_URL, DB_NAME} from '$lib/secrets'
import type {SubType as SubscribtionSchemaType} from './subscribtion'
import SubscribtionSchema from "./subscribtion";

const uri = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER_URL}/${DB_NAME}?retryWrites=true&w=majority`;

let conn:Connection

export async function open() {   
    if(!conn) {
        conn = await mongoose.createConnection(encodeURI(uri)).asPromise()
        const Subscribtion = conn.model<SubscribtionSchemaType>('Subscribtion', SubscribtionSchema)
        return {Subscribtion}
    }

    return {
        Subscribtion : conn.model<SubscribtionSchemaType>('Subscribtion')
    }
}

export async function close(){
    // opening and closing connection is ineffecient in mongoose
    // this is just mock implementation
    return
}


export type {
    SubscribtionSchemaType
}