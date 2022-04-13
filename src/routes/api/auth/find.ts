import type {RequestHandler} from '@sveltejs/kit'
import {isAuthenticated, findUser} from 'auth'
import type {FetchMap, API_URL} from 'interfaces'
export const post:RequestHandler = async function ({request}) {
    const auth = await isAuthenticated(request)
    const body = await request.json() as FetchMap[API_URL.AUTH_FIND]
    if(!auth) return {status:403}
    const users = await findUser(body.deviceId)
    const profile:{avatar:string, bio:string, nickname:string, id:string}[] = users.map(u=>({id:u.deviceId, bio:u.bio, avatar:u.avatar, nickname:u.nickname}))
    if(!profile) return {body:[]}
    return {
        body: JSON.stringify(profile),
        headers:{
            'Content-Type': 'application/json'
        }
    }

}
