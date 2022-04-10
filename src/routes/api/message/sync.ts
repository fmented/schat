import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {getCurrentUser, getSubscribtionList} from 'auth'
import {sendPush} from 'utils/push'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.MESSAGE_SYNC]
    const user = await getCurrentUser(request)
    if(user === null) return {status:403}
    const list = (await getSubscribtionList(user)).filter(s=>s.keys.auth === body.deviceId)
    list.forEach(async s=>{
        try {
            await sendPush(s, {event:'sync', data:body})
        } catch (error) {
            return
        }
    })
    

    return {}
}