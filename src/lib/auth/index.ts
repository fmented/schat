import cookie from "cookie"
import jwt from 'jsonwebtoken'
import {open, close} from 'model'
import type {JwtPayload} from 'jsonwebtoken'
import type {SubscribtionSchemaType} from 'model'
import { JWT_SECRET } from "$lib/secrets"

export async function authenticate(r:Request){
    const token = cookie.parse(r.headers.get('cookie') || '').token
    if(!token) return null
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
        if(!payload?.deviceId) return null
        const db = await open() 
        const user = await db.Subscribtion.findOne({deviceId:payload.deviceId})
        if(!user) return null
        return {user:payload.deviceId, avatar:user.avatar, nickname:user.nickname, bio:user.bio, token}
    } catch (error) {
        return null
    }
}

export async function subscribe(sub:SubscribtionSchemaType){
    const db = await open()
    await db.Subscribtion.create(sub)
    const token = jwt.sign({deviceId:sub.deviceId}, JWT_SECRET, {expiresIn: `${28*24}h`})
    await close()
    return token
}

export function setToken(token:string){
    return cookie.serialize('token', token, {httpOnly:true, maxAge:28*24*60*60, path:'/'})
}

export function invalidateToken(token:string){
    return cookie.serialize('token', token, {httpOnly:true, maxAge:0, path:'/'})
}

export async function unsubscribe(u:{deviceId:string}){
    const db= await open()
    await db.Subscribtion.deleteOne({deviceId:u.deviceId})
    await close()
}


export async function getUserDetail(deviceId:string):Promise<{bio:string, avatar:string, nickname:string}> {

    try {
        const db = await open()
        const user = await db.Subscribtion.findOne({deviceId})
        await close()
        if(!user?.id){
            return null
        }
        return {bio:user.bio, avatar:user.avatar, nickname:user.nickname}
    } catch (e) {
        console.log(e);
        return null
    }
}

export async function getSubscribtion(deviceId:string) {
    const db = await open()
    const sub = await db.Subscribtion.findOne({deviceId})
    await close()
    return sub
}

export async function getCurrentUser(request:Request):Promise<string|null> {
    const c = request.headers.get('cookie') || ''
    const cookies = cookie.parse(c)
    const token = cookies.token
    try {
        const t = jwt.verify(token, JWT_SECRET) as JwtPayload & SubscribtionSchemaType
        return t.deviceId as string
    } catch (error) {
        return null
    }
}

export async function findUser(q:string) {
    const db = await open()
    const people = await db.Subscribtion.find({nickname:new RegExp(`${q}`, 'g')})
    await close()
    return people
}

export async function updateProfile(deviceId:string, data:Partial<SubscribtionSchemaType>) {
    const db = await open()
    const u = await db.Subscribtion.findOne({deviceId})
    for(let k in data){
        u[k] = data[k]
    }
    await u.save()
    await close()
}