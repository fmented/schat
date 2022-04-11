import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {getSubscribtionList, isAuthenticated, getCurrentUser, updateProfile} from 'auth'
import {sendPush} from 'utils/push'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.UPDATE_AVATAR]
    const auth = await isAuthenticated(request)
    if(!auth) return {status:403};
    const user = await getCurrentUser(request)
    await updateProfile(user, body.content, 'avatar')
    const plist = body.receiver.map(async u=>{
        const list = await getSubscribtionList(u)
        
        list.map(async s=>{
            try {
                await sendPush(s, {event:'avatar_update', data:{username:user, avatar:body.content}})
            } catch (error) {
                console.log(error);
            }
        })
        
    })

    await Promise.all(plist)
    return {}
}