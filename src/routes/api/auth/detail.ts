import type {RequestHandler} from '@sveltejs/kit'
import {isAuthenticated, getUserDetail, isUserExist} from 'auth'
import type {FetchMap, API_URL} from 'interfaces'

export const post:RequestHandler = async function ({request}) {
    const auth = await isAuthenticated(request)
    const body = await request.json() as FetchMap[API_URL.AUTH_DETAIL]
    
    if(!auth) return {status:403}
    const exist = await isUserExist(body.deviceId)
    if(!exist) return {status:404}
    const profile = await getUserDetail(body.deviceId)    
    return {
        body: profile,
    }

}
