import type {FetchMap} from 'interfaces'

export async function sendRequest<P extends keyof FetchMap>(url:P, data:FetchMap[P], fetchCtx=fetch){
    const body = JSON.stringify(data)
    return fetchCtx(url, {
        body, 
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        }
    })
}