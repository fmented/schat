import type {RequestHandler} from '@sveltejs/kit'
import manifest from 'utils/manifest'
export const get:RequestHandler = async function () {
    return {
        status:200,
        body: manifest
    }
    
}