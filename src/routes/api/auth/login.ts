import type {RequestHandler} from '@sveltejs/kit'
import {createToken} from 'auth'
import type {FetchMap, API_URL} from 'interfaces'
import cookie from 'cookie'
export const post:RequestHandler = async function({request}){
    const body = await request.json() as FetchMap[API_URL.AUTH_LOGIN]
    try {
        const token = await createToken(body.username, body.password)
        if(!token) return {body:{status:'error', message:'cant create token'}}
        return {
            headers: {
                'set-cookie': cookie.serialize('token', token, {httpOnly:true, maxAge:28*24*60*60*1000, path:'/'})
            },
            body: {username:body.username, status:'ok'}   
        }
    } catch (err) {
        return {
            body: {status:'error', message:err.message}
        }
    }
    
}

export const get:RequestHandler = async function(){
    return {
        body: {status:'error', message:'only accept post request'}
    }
}


