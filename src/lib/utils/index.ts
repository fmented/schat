import {v4} from 'uuid'
export {SWBridge, SWContainerBridge} from './bridge'
export {sendRequest} from './fetch'
export function randomAvatar(){
    return `https://avatars.dicebear.com/api/bottts/${v4()}.svg`
}

function randboolean(){
    return Math.random()<.5
}

function randomId(male:boolean){
    return randInt(male? 128: 111)
}

function randInt(max:number){
    const min = Math.ceil(1)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randAva(){
    const g = randboolean()
    return `https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/${g?'male':'female'}/${randomId(g)}.png`
}
