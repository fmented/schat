import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import { getSubscribtion, authenticate} from 'auth'
import {sendPush} from 'utils/push'

export const post:RequestHandler= async function ({request}) {
    const auth = await authenticate(request)
    if(!auth) return {status:403}
    const body = await request.json() as FetchMap[API_URL.MESSAGE_SEEN]
    const sub = await getSubscribtion(body.receiver)    
    try {
        await sendPush(sub, {event:'message_seen', data:{id:body.id, deviceId:auth.user}})
    } catch (error) {
        console.log(error);
    }

    return {}
}