import type {RequestHandler} from '@sveltejs/kit'
import {authenticate, unsubscribe, invalidateToken} from 'auth'

export const post:RequestHandler= async function ({request}) {
    const auth = await authenticate(request)
    if(!auth) return {status:403}
    await unsubscribe({deviceId:auth.user})
    return {
        headers:{
            'set-cookie': invalidateToken(auth.token),
        },
    }
}

