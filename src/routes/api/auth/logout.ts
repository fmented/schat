import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {unsubscribe} from 'auth'
import cookie from 'cookie'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.AUTH_LOGOUT]
    const cookies = cookie.parse(request.headers.get('cookie')||'')
    
    await unsubscribe(body)

    return {
        headers: {
            'set-cookie': cookie.serialize('token', cookies.token, {httpOnly:true, maxAge:0, path:'/'})
        }
    }
}