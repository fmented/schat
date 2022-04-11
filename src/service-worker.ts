
/// <reference lib="webworker" />

import {SWBridge} from 'utils/bridge'
import { sendRequest } from 'utils/fetch'
import {v4 as uuid} from 'uuid'
import type {Chat, Profile} from 'interfaces'
import {API_URL} from 'interfaces'
import { Database } from 'idb'
import type {Database as DType} from 'idb'
const sw = self as unknown as ServiceWorkerGlobalScope

let db:DType<{chat:Chat, profile:Profile}>
let currentUser:string
const tags = new Set()
const s = new SWBridge(sw)

function initDB() {
    db = new Database<{chat:Chat, profile:Profile}>(currentUser, {
        chat: [
            {name:'from'},
            {name:'to'},
            {name:'content'},
            {name:'timeStamp'},
            {name:'id', unique:true},
            {name:'status'}
        ],
        profile:[
            {name:'username', unique:true},
            {name:'bio'},
            {name:'avatar'}
        ]
    })
}

s.on('after_login', async data=>{
    currentUser = data.username
    initDB()
    const deviceId = uuid()
    try {
        await sendRequest(API_URL.AUTH_SUBSCRIBE, {...data, deviceId})
        s.emit('subscribed', deviceId)
    } catch (error) {
        return
    }
})

s.on('open', s=>{
    currentUser = s
    initDB()
})


s.on('message_seen', async msg=>{
    if(!db) return
    await db.open()
    const m = await db.tables.chat.findOne({id:msg.id})
    await m.update({status:'seen'})
    await db.close()
    await s.emit('update', m.from===db.name?m.to:m.from)
})

s.on('message_received', async msg=>{
    if(!db) return
    await db.open()
    const m = await db.tables.chat.findOne({id:msg.id})
    await m.update({status:'received'})
    await db.close()
    await s.emit('update', m.from===currentUser?m.to:m.from)
})



s.on('message_new', async msg=>{    
    if(!db) return
    await db.open()
    let profileExists = await db.tables.profile.findOne({username:msg.from})
    if(!profileExists){
        const res = await (await sendRequest(API_URL.AUTH_DETAIL, {username:msg.from})).json()
        await db.tables.profile.insertOne({username:msg.from, bio:res.bio, avatar:res.avatar})
        profileExists = await db.tables.profile.findOne({username:msg.from})
    }
    if(!tags.has(msg.from)) tags.add(msg.from)
    await sw.registration.showNotification(msg.from, {tag:msg.from, body:msg.content, icon:profileExists.avatar, image:profileExists.avatar})
    try {
        await db.tables.chat.insertOne({...msg, status:'received'})
    } catch{
        const m = await db.tables.chat.findOne(msg)
        if(m){
            await m.update({status:'received'})
        }
    }
    await sendRequest(API_URL.MESSAGE_RECEIVED, {id:msg.to, receiver:msg.from})
    await db.close()
    await s.emit('update')
})


sw.addEventListener('notificationclick', e=>{
    e.action
    tags.delete(e.notification.tag)
})
sw.addEventListener('notificationclose', e=>{
    tags.delete(e.notification.tag)
})


s.on('bio_update', async u=>{
    if(!db) return
    await db.open()
    const user = await db.tables.profile.findOne({username:u.username})
    await user.update({bio:u.bio})
    await db.close()
    await s.emit('profile_update', user)
})

s.on('avatar_update', async u=>{
    if(!db) return
    await db.open()
    const user = await db.tables.profile.findOne({username:u.username})
    await user.update({avatar:u.avatar})
    await db.close()
    await s.emit('profile_update', user)
})


s.on('sync', async data=>{
    if(!db) return
    await db.open()
    const ch = data.chat.map(async c=>{
        if(await db.tables.chat.findOne({id:c.id})) return
        await db.tables.chat.insertOne(c)
    })
    const pr = data.profile.map(async p=>{
        if(await db.tables.profile.findOne({username:p.username})) return
        await db.tables.profile.insertOne(p)
    })

    await Promise.all([...ch, ...pr])
    await s.emit('update')
    await db.close()
})

sw.addEventListener('install', ()=>{
    sw.skipWaiting()
})
