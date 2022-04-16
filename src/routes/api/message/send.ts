import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {getSubscribtion, authenticate } from 'auth'
import {sendPush} from 'utils/push'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.MESSAGE_SEND]
    const auth = await authenticate(request)
    if(!auth) return {status:403}
    const sub = await getSubscribtion(body.to)
    try {
        await sendPush(sub, {event:'message_new', data:{...body, alias:auth.nickname, thumbnail:auth.avatar}})
    } catch (error) {
        console.log(error);
    }
    return {}
}