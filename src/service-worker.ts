
/// <reference lib="webworker" />

import {SWBridge} from 'utils/bridge'
import { sendRequest } from 'utils/fetch'
import {v4 as uuid} from 'uuid'
import type {Chat, Profile} from 'interfaces'
import {API_URL} from 'interfaces'
import { Database } from 'idb'
import type {Database as DType} from 'idb'
import { build, files, version } from '$service-worker';

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
		event.respondWith(
			(async () => {
				const cachedAsset = isStaticAsset && (await caches.match(event.request));
				return cachedAsset || fetchAndCache(event.request);
			})()
		);
	}
});


const sw = self as unknown as ServiceWorkerGlobalScope

let db:DType<{chat:Chat, profile:Profile}>
let currentUser:string
const tags = new Set()
const s = new SWBridge(sw)

function initDB() {
    if(!currentUser) return
    db = new Database<{chat:Chat, profile:Profile}>(currentUser, {
        chat: [
            {name:'from'},
            {name:'to'},
            {name:'content'},
            {name:'timeStamp'},
            {name:'id', unique:true},
            {name:'status'}
        ],
        profile:[
            {name:'username', unique:true},
            {name:'bio'},
            {name:'avatar'}
        ]
    })
}

s.on('after_login', async data=>{
    currentUser = data.username
    initDB()
    const deviceId = uuid()
    try {
        await sendRequest(API_URL.AUTH_SUBSCRIBE, {...data, deviceId})
        s.emit('subscribed', deviceId)
    } catch (error) {
        return
    }
})

s.on('open', s=>{
    currentUser = s
    initDB()
})

s.on('before_logout', async d=>{
    const res = await sendRequest(API_URL.AUTH_LOGOUT, {deviceId:d})
    if(res.ok){
        const x = await sw.registration.pushManager.getSubscription()
        if(x) await x.unsubscribe()
        s.emit('unsubscribed')
    }
    currentUser = undefined
    db = undefined
})

s.on('message_seen', async msg=>{
    if(!db) return
    await db.open()
    const m = await db.tables.chat.findOne({id:msg.id})
    await m.update({status:'seen'})
    await db.close()
    await s.emit('update', m.from===db.name?m.to:m.from)
})

s.on('message_received', async msg=>{
    if(!db) return
    await db.open()
    const m = await db.tables.chat.findOne({id:msg.id})
    await m.update({status:'received'})
    await db.close()
    return await s.emit('update', m.from===currentUser?m.to:m.from)
})

s.on('message_new', async msg=>{    
    if(!db) return
    await db.open()
    let profileExists = await db.tables.profile.findOne({username:msg.from})
    if(!profileExists){
        const res = await (await sendRequest(API_URL.AUTH_DETAIL, {username:msg.from})).json()
        await db.tables.profile.insertOne({username:msg.from, bio:res.bio, avatar:res.avatar})
        profileExists = await db.tables.profile.findOne({username:msg.from})
    }
    
    await db.tables.chat.insertOne({...msg, status:'received'})
    await sendRequest(API_URL.MESSAGE_RECEIVED, {id:msg.to, receiver:msg.from})
    await db.close()
    const _clients = await sw.clients.matchAll()
    if(_clients.length===0){
        if(!tags.has(msg.from)) tags.add(msg.from)
        return sw.registration.showNotification(msg.from, {
            tag: msg.from, 
            body: msg.content, 
            icon : '/android-chrome-192x192.png', 
            renotify: false,
            vibrate: [100, 200, 300, 200, 100, 200, 300],
            timestamp: msg.timeStamp
        })
    }
    else return await s.emit('update')
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

s.on('bio_update', async u=>{
    if(!db) return
    await db.open()
    const user = await db.tables.profile.findOne({username:u.username})
    await user.update({bio:u.bio})
    await db.close()
    return await s.emit('profile_update', user)
})

s.on('avatar_update', async u=>{
    if(!db) return
    await db.open()
    const user = await db.tables.profile.findOne({username:u.username})
    await user.update({avatar:u.avatar})
    await db.close()
    return await s.emit('profile_update', user)
})

s.on('sync', async data=>{
    if(!db) return
    await db.open()
    const ch = data.chat.map(async c=>{
        if(await db.tables.chat.findOne({id:c.id})) return
        await db.tables.chat.insertOne(c)
    })
    const pr = data.profile.map(async p=>{
        if(await db.tables.profile.findOne({username:p.username})) return
        await db.tables.profile.insertOne(p)
    })

    await Promise.all([...ch, ...pr])
    await s.emit('update')
    await db.close()
})