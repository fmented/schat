import type {RequestHandler} from '@sveltejs/kit'
import {isAuthenticated, isUserExist} from 'auth'

export const get:RequestHandler = async function ({request, params}) {
    const auth = await isAuthenticated(request)
    if(!auth) return {status:403}
    const exist = await isUserExist(params.user)    
    if(exist) return {status:301, headers:{'location': `/chat/${params.user}`}}
    return {body:{u:params.user}}
}
