import {v4} from 'uuid'
export {SWBridge, SWContainerBridge} from './bridge'
export {sendRequest} from './fetch'
export function randomAvatar(){
    return `https://avatars.dicebear.com/api/bottts/${v4()}.svg`
}