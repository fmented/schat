import type {RequestHandler} from '@sveltejs/kit'
import {isAuthenticated, getUserDetail, isUserExist, getCurrentUser} from 'auth'

export const get:RequestHandler = async function ({request, params}) {
    const auth = await isAuthenticated(request)    
    if(!auth) return {status:401}
    if(await getCurrentUser(request) === params.user) return {status:301, headers:{location: '/chat'} }
    const exist = await isUserExist(params.user)
    if(!exist) return {status:301, headers:{location:`/chat/archive/${params.user}`}}
    const profile = await getUserDetail(params.user)    
    
    return {
        body: profile,
    }

}
