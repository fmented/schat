import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {getSubscribtionList, isAuthenticated} from 'auth'
import {sendPush} from 'utils/push'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.MESSAGE_RECEIVED]
    const auth = await isAuthenticated(request)
    if(!auth) return {status:403};
    const list = await getSubscribtionList(body.receiver)
    
    const plist = list.map(async s=>{
        try {
            await sendPush(s, {event:'message_received', data:{id:body.id}})
        } catch (error) {
            return
        }
    })

    await Promise.all(plist)

    return {}
}