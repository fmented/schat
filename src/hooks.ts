import type {GetSession, Handle} from '@sveltejs/kit' 
import {authenticate} from 'auth'

export const getSession: GetSession = async function (event) {
    const {request} = event
    const auth = await authenticate(request)
    if(!auth) return {user:null, bio:null, avatar:null, nickname:null}
    return auth
}

export const handle:Handle = async function ({event, resolve}) {
        const res = await resolve(event)
        res.headers.set('Access-Control-Allow-Methods', '*')
        return res
}