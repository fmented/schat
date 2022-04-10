/// <reference lib="webworker" />
import type {SWEventMap, PostMessageEventMap} from 'interfaces'


type Callback<T> = (data?:T)=>void

export class SWBridge{
    #sw:ServiceWorkerGlobalScope

    constructor(sw: ServiceWorkerGlobalScope){
        this.#sw = sw
    }

    on<P extends keyof SWEventMap>(ev:P, cb:Callback<SWEventMap[P]>){
        this.#sw.addEventListener('message', (e:MessageEvent)=>{

            const data = e.data.data as SWEventMap[P]
            const event = e.data.event as P
            if(ev===event){
                return cb(data)
            }
        })

        this.#sw.addEventListener('push', async (e:PushEvent)=>{
            const d = await e.data.json()
            const data = d.data as SWEventMap[P]
            const event = d.event as P
            if(ev===event){
                return cb(data)
            }
        })
    }



    async emit<P extends keyof PostMessageEventMap>(event:P, data?:PostMessageEventMap[P]){
        this.#sw.clients.matchAll().then(clients=>{
            clients.forEach(client=>client.postMessage({event, data}))
        })
    }

}

export class SWContainerBridge{
    #sw:ServiceWorkerContainer

    constructor(sw: ServiceWorkerContainer){
        this.#sw = sw
    }

    on<P extends keyof PostMessageEventMap>(ev:P, cb:Callback<PostMessageEventMap[P]>){
        this.#sw.addEventListener('message', (e:MessageEvent)=>{
            const data = e.data.data as PostMessageEventMap[P]
            const event = e.data.event as P
            if(ev===event){
                return cb(data)
            }
        })
    }
    async emit<P extends keyof PostMessageEventMap>(ev:P, data:PostMessageEventMap[P]){
        this.#sw.ready.then(reg=>{
            reg.active.postMessage({event:ev, data})
        })
    }
}