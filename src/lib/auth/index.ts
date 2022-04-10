import cookie from "cookie"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {open, close} from 'model'
import type {JwtPayload} from 'jsonwebtoken'
import type {Profile} from 'interfaces'
import type {UserSchemaType, SubscribtionSchemaType} from 'model'
import { JWT_SECRET } from "$lib/secrets"

export async function createToken(username:string, password:string){
    let token:string;
    if(! (await isUserExist(username))) throw new Error('user does not exist')
    try {
        const db = await open()
        const user = await db.User.findOne({username}).lean()
        await close()
        if(await bcrypt.compare(password, user.password)){
            token = jwt.sign({id:user._id, username:user.username, email:user.email, type:'user'}, JWT_SECRET, {expiresIn: `${28*24}h`})
            return token
        }
        throw new Error('invalid username or password')
    } catch (err) {
        throw(err)
    }
}

export async function subscribe(sub:SubscribtionSchemaType){
    const db = await open()
    await db.Subscribtion.create(sub)
    await close()
}

export async function unsubscribe(u:{deviceId:string}){
    const db= await open()
    await db.Subscribtion.findOneAndDelete(u)
    await close()
}

export async function isTokenValid(token:string){
    try {
        const t = jwt.verify(token, JWT_SECRET) as JwtPayload
        if(!t.username) return false
        const userExists = await isUserExist(t.username)
        if(!userExists) return false
        return true
    } catch (err) {
        return false
    }
}

export async function getIdFromToken(token:string):Promise<{id?:string, error?:string}> {
    try {
        const t = jwt.verify(token, JWT_SECRET) as JwtPayload
        return{
            id: t.id
        }
    } catch (err) {
        return {error:err}
    }
}

export async function isUserExist(username:string){
    try {
        const db = await open()
        const user = await db.User.findOne({username}).lean()
        await close()
        if(!user){
            return false
        }
        return true
    } catch (err) {
        return false
    }
}

export async function getUserDetail(username:string):Promise<Profile> {

    try {
        const db = await open()
        const user = await db.User.findOne({username})
        await close()
        if(!user?.username){
            throw new Error('user not found')
        }
        return {bio:user.bio, avatar:user.avatar, username:user.username}
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

export async function createAccount(data:UserSchemaType) {
    const userExists = await isUserExist(data.username)
    if(userExists){
        throw new Error('user does exist')
    }
    const db = await open()
    const hashedPassword = await bcrypt.hash(data.password, 10)

    await db.User.create({...data, password:hashedPassword, avatar:`https://avatars.dicebear.com/api/bottts/${data.username}.svg`})
    await close()
}

export async function getSubscribtionList(username:string) {
    const db = await open()
    const list = await db.Subscribtion.find({username})
    await close()
    return list
    
}

export async function getCurrentUser(request:Request):Promise<string|null> {
    const c = request.headers.get('cookie') || ''
    const cookies = cookie.parse(c)
    const auth = await isAuthenticated(request)
    if(!auth) return null
    const token = cookies.token
    const t = jwt.verify(token, JWT_SECRET) as JwtPayload
    return t.username as string
}

export async function findUser(name:string) {
    const db = await open()
    const people = await db.User.find({username:new RegExp(`${name}`, 'g')})
    await close()
    return people
}

export async function updateProfile(username:string, content:string, type:'bio'|'avatar') {
    const db = await open()
    const u = await db.User.findOne({username})
    u[type] = content
    await u.save()
    await close()
}