import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {getCurrentUser, getSubscribtion, isAuthenticated} from 'auth'
import {sendPush} from 'utils/push'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.MESSAGE_RECEIVED]
    const auth = await isAuthenticated(request)
    if(!auth) return {status:403};
    const sub = await getSubscribtion(body.receiver)
    const u = await getCurrentUser(request)
    
    try {
        await sendPush(sub, {event:'message_received', data:{id:body.id, deviceId:u}})
    } catch (error) {
        console.log(error);
        
    }

    return {}
}