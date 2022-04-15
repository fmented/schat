
/// <reference lib="webworker" />

import {SWBridge} from 'utils/bridge'
import { sendRequest } from 'utils/fetch'
import {API_URL} from 'interfaces'
import { build, files, version } from '$service-worker';
import manifest from 'utils/manifest'
import {updateMessageStatus, initDB} from 'utils/helper'

const worker = (self as unknown) as ServiceWorkerGlobalScope;
const FILES = `cache${version}`;
const to_cache = build.concat(files);
const staticAssets = new Set(to_cache);

worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(FILES)
			.then((cache) => cache.addAll(to_cache))
			.then(() => {
				worker.skipWaiting();
			})
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			// delete old caches
			for (const key of keys) {
				if (key !== FILES) await caches.delete(key);
			}
			worker.clients.claim();
		})
	);
});

async function fetchAndCache(request: Request) {
	const cache = await caches.open(`offline${version}`);
	try {
		const response = await fetch(request);
		cache.put(request, response.clone());
		return response;
	} catch (err) {
		const response = await cache.match(request);
		if (response) return response;

		throw err;
	}
}

worker.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET' || event.request.headers.has('range')) return;

	const url = new URL(event.request.url);

	const isHttp = url.protocol.startsWith('http');
	const isDevServerRequest =
		url.hostname === self.location.hostname && url.port !== self.location.port;
	const isStaticAsset = url.host === self.location.host && staticAssets.has(url.pathname);
	const skipBecauseUncached = event.request.cache === 'only-if-cached' && !isStaticAsset;

	if (isHttp && !isDevServerRequest && !skipBecauseUncached) {
        if(event.request.url.endsWith('/manifest.json') && db){
            return event.waitUntil(async () =>{
                await db.open()
                const shortcuts = await Promise.all(
                    await db.tables.conv.retrieve(async c=>{
                        return {name:c.alias, url:`/chat/${c.with}`, icons:[{src:c.thumbnail, sizes:'185x185', type:'image/png'}]}
                    }, {direction:'prev'})
                )
                await db.close()
                if(shortcuts.length > 3) shortcuts.slice(0, 3)
                event.respondWith(
                    new Response(JSON.stringify({...manifest, shortcuts:[...manifest.shortcuts, ...shortcuts]}))
                )
            })
        }
		event.respondWith(
			(async () => {
				const cachedAsset = isStaticAsset && (await caches.match(event.request));
				return cachedAsset || fetchAndCache(event.request);
			})()
		);
	}
});


const sw = self as unknown as ServiceWorkerGlobalScope

let db = initDB()
const tags = new Map()
const s = new SWBridge(sw)


s.on('before_unsubscribe',  async()=>{
    const sub = await sw.registration.pushManager.getSubscription()    
    if(sub) {
        await sub.unsubscribe()
        if(db) {
            await db.open()
            await db.tables.conv.clear()
            await db.delete()
        }
        db=undefined
    }
    await s.emit('unsubscribed')
})


s.on('message_seen', async ({id, deviceId})=>{
    if(!db) return
    await db.open()
    const conv = await db.tables.conv.findOne({with:deviceId})
    if(!conv) return
    await conv.update({chat: updateMessageStatus(conv.chat, 'seen', id)})
    await s.emit('update', deviceId)
})

s.on('message_received', async ({id, deviceId})=>{
    if(!db) return
    await db.open()
    const m = await db.tables.conv.findOne({with:deviceId})
    if(!m) return
    await m.update({chat:updateMessageStatus(m.chat, 'received', id)})
    return await s.emit('update', deviceId)
})

s.on('message_new', async msg=>{    
    if(!db) return
    await db.open()    
    let conv = await db.tables.conv.findOne({with:msg.from})
    if(!conv){
        await db.tables.conv.insertOne({thumbnail:msg.thumbnail, alias:msg.alias, chat:[], with:msg.from})
        conv = await db.tables.conv.findOne({with:msg.from})
    }    

    const res = await sendRequest(API_URL.MESSAGE_RECEIVED, {id:msg.id, receiver:msg.from})
    if(res.ok) {
        await db.open()
        await conv.update({
            thumbnail:msg.thumbnail,
            alias:msg.alias,
            chat:[...conv.chat, {
                timeStamp:msg.timeStamp, 
                to:msg.to,
                from:msg.from,
                status:'received',
                id:msg.id,
                content:msg.content
            }]})
    }

    await s.emit('update', msg.from)
    if(tags.has(msg.from)) tags.set(msg.from, tags.get(msg.from)+1)
    else tags.set(msg.from, 1)
    return await sw.registration.showNotification(msg.alias , {
            tag: msg.from, 
            body: tags.get(msg.from)=== 1 ? msg.content: `${tags.get(msg.from)} unread messages`, 
            icon : msg.thumbnail, 
            renotify: false,
            vibrate: [100, 200, 300, 200, 100, 200, 300],
            timestamp: msg.timeStamp,
            badge:'/favicon-32x32.png'
        })

})

sw.addEventListener('notificationclick', e=>{
    tags.delete(e.notification.tag)
    e.notification.close()
    sw.clients.openWindow(`/chat/${e.notification.tag}`)
})

sw.addEventListener('notificationclose', e=>{
    tags.delete(e.notification.tag)
    e.notification.close()
})
