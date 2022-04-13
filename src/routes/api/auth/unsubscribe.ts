import type {RequestHandler} from '@sveltejs/kit'
import {invalidateToken, getCurrentUser, unsubscribe} from 'auth'
import cookie from 'cookie'

export const post:RequestHandler= async function ({request}) {
    const user = await getCurrentUser(request)
    if (user) await unsubscribe({deviceId:user})
    const cookies = cookie.parse(request.headers.get('cookie')||'')
    return {
        status:301,
        headers:{
            'set-cookie': invalidateToken(cookies.token),
        }
    }
}