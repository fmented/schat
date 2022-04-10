import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {subscribe, isAuthenticated} from 'auth'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.AUTH_SUBSCRIBE]
    const auth = await isAuthenticated(request)
    if(!auth) return {status:403}
    await subscribe(body)
    return {
    }
}