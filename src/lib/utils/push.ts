import push from 'web-push'
import type {PushSubscription} from 'web-push'
import type {PushEventMap} from 'interfaces'


export async function sendPush<P extends keyof PushEventMap>(sub:PushSubscription, data:{event:P, data?:PushEventMap[P]}){
    return push.sendNotification(sub, JSON.stringify(data), {
        vapidDetails:{
            subject:import.meta.env.VITE_SUBJECT,
            publicKey:import.meta.env.VITE_PUBLIC_KEY,
            privateKey:import.meta.env.VITE_PRIVATE_KEY
        }
    })
}
