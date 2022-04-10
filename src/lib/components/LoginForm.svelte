<script lang="ts" type="svelte-data">
import { sendRequest, SWContainerBridge } from "utils";
import type { SWContainerBridge as SWCType } from "utils";
import { onMount} from 'svelte';
import {PUBLIC_KEY} from '$lib/secrets'
import {API_URL} from 'interfaces'
import { goto } from "$app/navigation";
let username=''
let password=''
let s:SWCType
let message:string = ''

onMount(()=>{

    s= new SWContainerBridge(navigator.serviceWorker)
})

let process= false

async function onClick(){
    if(!username || !password) return 
    process = true
    message = ''
    const res = await sendRequest(API_URL.AUTH_LOGIN, {username, password}, window.fetch)
    
    if(res.ok){
        const {status, message:msg} = await res.json()

        if(status == 'error') {
            message = msg
            return process = false
        }
        const sw = await navigator.serviceWorker.ready
        const sub = await sw.pushManager.subscribe({
            userVisibleOnly:true,
            applicationServerKey:PUBLIC_KEY
        })
        const p256dh = sub.toJSON().keys.p256dh
        const auth = sub.toJSON().keys.p256dh
        const subscribtion = {
            endpoint: sub.endpoint,
            keys: {auth, p256dh},
            username
        }
        s.emit('after_login', subscribtion)
        s.on('subscribed', s =>{
            localStorage.setItem('deviceId', s)
            window.location.href = '/chat'       
        })

    }
    process = false
}
</script>

<div class="wrap">
    <p>{process? 'Please Wait': message}</p>

    <label for="username">Username</label>
    <input type="text" id="username" bind:value="{username}">

    <label for="password">Password</label>
    <input type="password" id="password" bind:value="{password}">
    
    <button on:click={onClick} disabled={process}>Login</button>
</div>

<style>
    .wrap{
        display: flex;
        flex-direction: column;
        gap: .25rem;
    }

    button{
        margin-top: .5rem;
    }

    input, button{
        padding: .5rem .25rem;
    }

</style>