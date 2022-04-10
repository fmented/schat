import type {GetSession, Handle} from '@sveltejs/kit' 
import {isAuthenticated, getCurrentUser, getUserDetail} from 'auth'

export const getSession: GetSession = async function (event) {
    const {request} = event
    const auth = await isAuthenticated(request)
    if(!auth) {
        return {user:null, bio:null, avatar:null}
    }
    const user = await getCurrentUser(request)
    const session = await getUserDetail(user)
    return {avatar:session.avatar, user, bio:session.bio}
}

export const handle:Handle = async function ({event, resolve}) {
        const res = await resolve(event)
        res.headers.set('Access-Control-Allow-Methods', '*')
        return res
}