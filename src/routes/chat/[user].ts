import type {RequestHandler} from '@sveltejs/kit'
import {getUserDetail, authenticate} from 'auth'

export const get:RequestHandler = async function ({request, params}) {
    const auth = await authenticate(request)
    if (!auth) return {status:301, headers:{location:`/`}}
    if(auth.user === params.user) return {status:301, headers:{location:`/chat`}}
    const profile = await getUserDetail(params.user)    
    if(!profile) return {status:301, headers:{location:`/chat/archive/${params.user}`}}
    return {
        body: {avatar:profile.avatar, nickname:profile.nickname, user:params.user},
    }

}
