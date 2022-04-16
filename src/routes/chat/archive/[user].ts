import type {RequestHandler} from '@sveltejs/kit'
import {authenticate, getUserDetail} from 'auth'

export const get:RequestHandler = async function ({request, params}) {
    const auth = await authenticate(request)
    if(!auth) return {status:403}
    const exist = await getUserDetail(params.user)    
    if(exist) return {status:301, headers:{'location': `/chat/${params.user}`}}
    return {body:{u:params.user}}
}
