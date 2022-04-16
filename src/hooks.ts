import type {GetSession, Handle} from '@sveltejs/kit' 
import {isAuthenticated, getCurrentUser, getUserDetail} from 'auth'
import cookie from 'cookie'

export const getSession: GetSession = async function (event) {
    const {request, params} = event
    const auth = isAuthenticated(request)
    if(!auth) return {user:null, bio:null, avatar:null, nickname:null}
    const x = await getCurrentUser(request)
    try {
        const s = await getUserDetail(x)
        return {user:x, ...s}
    } catch (error) {
        return {user:null, bio:null, avatar:null, nickname:null}
    }
}

export const handle:Handle = async function ({event, resolve}) {
        const res = await resolve(event)
        res.headers.set('Access-Control-Allow-Methods', '*')
        return res
}