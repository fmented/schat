import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {subscribe, setToken} from 'auth'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.AUTH_SUBSCRIBE]
    const token = await subscribe(body)
    if(!token) return {status:400}
    return {
        status:301,
        headers:{
            'set-cookie': setToken(token),
        }
    }
}