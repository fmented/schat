import type {RequestHandler} from '@sveltejs/kit'
import type {FetchMap, API_URL} from 'interfaces'
import {isAuthenticated, getCurrentUser, updateProfile} from 'auth'

export const post:RequestHandler= async function ({request}) {
    const body = await request.json() as FetchMap[API_URL.UPDATE_PROFILE]
    const auth = await isAuthenticated(request)
    if(!auth) return {status:403};
    const user = await getCurrentUser(request)
    await updateProfile(user, {bio:body.bio, avatar:body.avatar, nickname:body.nickname})
    return {}
}