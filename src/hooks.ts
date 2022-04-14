import type {GetSession, Handle} from '@sveltejs/kit' 
import {isAuthenticated, getCurrentUser, getUserDetail} from 'auth'

export const getSession: GetSession = async function (event) {
    const {request} = event
    const auth = await isAuthenticated(request)
    if(!auth) {
        return {user:null, bio:null, avatar:null, nickname:null}
    }
    const user = await getCurrentUser(request)    
    const session = await getUserDetail(user)
    if(!session) return {user:null, bio:null, avatar:null, nickname:null}
    return {...session, user}
}

export const handle:Handle = async function ({event, resolve}) {
        const res = await resolve(event)
        res.headers.set('Access-Control-Allow-Methods', '*')
        return res
}