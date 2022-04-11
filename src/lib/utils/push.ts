import push from 'web-push'
import type {PushSubscription} from 'web-push'
import type {PushEventMap} from 'interfaces'


export async function sendPush<P extends keyof PushEventMap>(sub:PushSubscription, data:{event:P, data?:PushEventMap[P]}){
    push.setVapidDetails(
        import.meta.env.VITE_SUBJECT,
        import.meta.env.VITE_PUBLIC_KEY,
        import.meta.env.VITE_PRIVATE_KEY
    )
    return push.sendNotification(sub, JSON.stringify(data))
}
