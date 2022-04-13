import cookie from "cookie"
import jwt from 'jsonwebtoken'
import {open, close} from 'model'
import type {JwtPayload} from 'jsonwebtoken'
import type {SubscribtionSchemaType} from 'model'
import { JWT_SECRET } from "$lib/secrets"

export async function subscribe(sub:SubscribtionSchemaType){
    const db = await open()
    await db.Subscribtion.create(sub)
    const token = jwt.sign({deviceId:sub.deviceId}, JWT_SECRET, {expiresIn: `${28*24}h`})
    await close()
    return token
}

export function setToken(token:string){
    return cookie.serialize('token', token, {httpOnly:true, maxAge:28*24*60*60*1000, path:'/'})
}

export function invalidateToken(token:string){
    return cookie.serialize('token', token, {httpOnly:true, maxAge:0, path:'/'})
}

export async function unsubscribe(u:{deviceId:string}){
    const db= await open()
    await db.Subscribtion.deleteOne({deviceId:u.deviceId})
    await close()
}

export async function isTokenValid(token:string){
    try {
        const t = jwt.verify(token, JWT_SECRET) as JwtPayload & SubscribtionSchemaType
        if(!t.nickname || !t.deviceId) return false
        const userExists = await isUserExist(t.nickname)
        if(!userExists) return false
        return true
    } catch (err) {
        return false
    }
}

export async function isUserExist(deviceId:string){
    try {
        const db = await open()
        const user = await db.Subscribtion.findOne({deviceId}).lean()
        await close()
        if(!user){
            return false
        }
        return true
    } catch (err) {
        return false
    }
}

export async function getUserDetail(deviceId:string):Promise<{bio:string, avatar:string, nickname:string}> {

    try {
        const db = await open()
        const user = await db.Subscribtion.findOne({deviceId})
        await close()
        if(!user?.id){
            throw new Error('user not found')
        }
        return {bio:user.bio, avatar:user.avatar, nickname:user.nickname}
    } catch (e) {
        throw e
    }
}

export async function isAuthenticated(request:Request){
    const c = request.headers.get('cookie')||''
    const cookies = cookie.parse(c)
    if(!('token' in cookies)) return false
    const validToken = isTokenValid(cookies.token)
    if(!validToken) return false
    return true
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
    const auth = await isAuthenticated(request)
    if(!auth) return null
    const token = cookies.token
    const t = jwt.verify(token, JWT_SECRET) as JwtPayload & SubscribtionSchemaType
    return t.deviceId as string
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