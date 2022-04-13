import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {getSubscribtion, isAuthenticated, getUserDetail} from 'auth'
import {sendPush} from 'utils/push'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.MESSAGE_SEND]
    const auth = await isAuthenticated(request)
    if(!auth) return {status:403};
    const sub = await getSubscribtion(body.to)
    const user = await getUserDetail(body.from)    
    try {
        await sendPush(sub, {event:'message_new', data:{...body, alias:user.nickname, thumbnail:user.avatar}})
    } catch (error) {
        console.log(error);
    }
    return {}
}