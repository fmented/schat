import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {createAccount} from 'auth'

export const post:RequestHandler= async function ({request}) {    
    const body = await request.json() as FetchMap[API_URL.AUTH_SIGNUP]
    try {
        await createAccount(body)
        return {
            body: {status: 'ok', message:'success'}
        }
    } catch (e) {
        return {
            body: {status: 'error', message: e.message}
        }
    }
}