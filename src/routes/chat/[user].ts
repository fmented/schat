import type {RequestHandler} from '@sveltejs/kit'
import {getUserDetail} from 'auth'

export const get:RequestHandler = async function ({request, params}) {
    const profile = await getUserDetail(params.user)    
    if(!profile) return {status:301, headers:{location:`/chat/archive/${params.user}`}}
    return {
        body: {avatar:profile.avatar, nickname:profile.nickname, user:params.user},
    }

}
